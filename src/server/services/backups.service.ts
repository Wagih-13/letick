import { backupsRepository } from "../repositories/backups.repository";
import { success, failure, type ServiceResult } from "../types";
import { writeAudit } from "../utils/audit";
import type { ActorContext } from "./role.service";
import { getBackupsDir } from "../utils/paths";
import { mkdir, stat, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { gzip } from "zlib";
import { promisify } from "util";
import { execFile } from "child_process";
import { db } from "@/shared/db";
import { sql } from "drizzle-orm";

const gzipAsync = promisify(gzip);
const execFileAsync = promisify(execFile);

class BackupsService {
  async list(params: { page?: number; limit?: number; sort?: "createdAt.desc" | "createdAt.asc" }) {
    try {
      const res = await backupsRepository.list(params);
      return success(res);
    } catch (e: any) {
      return failure("LIST_BACKUPS_FAILED", e?.message || "Failed to list backups");
    }
  }

  async create(input: { name?: string }, actor?: ActorContext) {
    try {
      const dir = getBackupsDir();
      await mkdir(dir, { recursive: true });

      // Try pg_dump first (best practice for Postgres)
      const url = process.env.DATABASE_URL;
      let fileName = `backup-${Date.now()}.dump`;
      let filePath = path.join(dir, fileName);
      let usedPgDump = false;
      if (url) {
        const pgDumpBin = process.env.PG_DUMP_PATH || (process.platform === "win32" ? "pg_dump.exe" : "pg_dump");
        try {
          await execFileAsync(pgDumpBin, ["--no-owner", "--no-privileges", "-Fc", "-Z", "9", "-f", filePath, "-d", url], { env: process.env });
          const st = await stat(filePath);
          usedPgDump = true;
          const item = await backupsRepository.createManual({ name: input.name || "Manual Backup", createdBy: actor?.userId ?? null, fileName, filePath, status: "completed" });
          await backupsRepository.finalize(item.id, st.size);
          const latest = await backupsRepository.findById(item.id);
          await writeAudit({ action: "create", resource: "backup", resourceId: item.id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, metadata: { method: "pg_dump", fileName, filePath, fileSize: st.size } as any });
          return success(latest);
        } catch {
          // fall back
        }
      }

      // Fallback: JSON snapshot of all user tables
      fileName = `backup-${Date.now()}.json.gz`;
      filePath = path.join(dir, fileName);
      const snapshot = await this.buildJsonSnapshot();
      const gz = await gzipAsync(Buffer.from(JSON.stringify(snapshot)));
      await writeFile(filePath, gz);
      const st = await stat(filePath);
      const item = await backupsRepository.createManual({ name: input.name || "Manual Backup", createdBy: actor?.userId ?? null, fileName, filePath, status: "completed" });
      await backupsRepository.finalize(item.id, st.size);
      const latest = await backupsRepository.findById(item.id);
      await writeAudit({
        action: "create",
        resource: "backup",
        resourceId: item.id,
        userId: actor?.userId,
        ipAddress: actor?.ip ?? undefined,
        userAgent: actor?.userAgent ?? undefined,
        changes: { name: input.name ?? "" } as any,
        metadata: { method: usedPgDump ? "pg_dump" : "json", fileName: (latest as any)?.fileName, filePath: (latest as any)?.filePath, fileSize: (latest as any)?.fileSize, status: (latest as any)?.status } as any,
      });
      return success(latest);
    } catch (e: any) {
      return failure("CREATE_BACKUP_FAILED", e?.message || "Failed to create backup");
    }
  }

  async remove(id: string, actor?: ActorContext): Promise<ServiceResult<{ id: string }>> {
    try {
      const existing = await backupsRepository.findById(id);
      const ok = await backupsRepository.delete(id);
      if (!ok) return failure("NOT_FOUND", "Backup not found");
      // try unlink file
      if (existing?.filePath) {
        try {
          await unlink(existing.filePath).catch(() => {});
        } catch {}
      }
      await writeAudit({ action: "delete", resource: "backup", resourceId: id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined });
      return success({ id });
    } catch (e: any) {
      return failure("DELETE_BACKUP_FAILED", e?.message || "Failed to delete backup");
    }
  }

  async finalize(id: string) {
    try {
      const row = await backupsRepository.finalize(id);
      if (!row) return failure("NOT_FOUND", "Backup not found");
      return success(row);
    } catch (e: any) {
      return failure("FINALIZE_BACKUP_FAILED", e?.message || "Failed to finalize backup");
    }
  }

  async retention(params: { keepLast?: number; maxAgeDays?: number }) {
    try {
      const result = await backupsRepository.cleanupRetention(params);
      return success(result);
    } catch (e: any) {
      return failure("RETENTION_FAILED", e?.message || "Failed to cleanup backups");
    }
  }

  async findById(id: string) {
    try {
      const row = await backupsRepository.findById(id);
      if (!row) return failure("NOT_FOUND", "Backup not found");
      return success(row);
    } catch (e: any) {
      return failure("GET_BACKUP_FAILED", e?.message || "Failed to get backup");
    }
  }

  async restore(id: string, actor?: ActorContext) {
    try {
      const found = await backupsRepository.findById(id);
      if (!found) return failure("NOT_FOUND", "Backup not found");
      // If it's a pg_dump file, use pg_restore
      if (found.fileName.endsWith(".dump")) {
        const url = process.env.DATABASE_URL;
        if (!url) return failure("NO_DB_URL", "DATABASE_URL not set");
        const pgRestoreBin = process.env.PG_RESTORE_PATH || (process.platform === "win32" ? "pg_restore.exe" : "pg_restore");
        // --clean: drop objects before recreating; --if-exists avoids errors; --no-owner avoids role issues
        await execFileAsync(pgRestoreBin, ["--clean", "--if-exists", "--no-owner", "--no-privileges", "-d", url, found.filePath], { env: process.env });
        await writeAudit({ action: "update", resource: "backup.restore", resourceId: id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, metadata: { method: "pg_restore" } });
        return success({ method: "pg_restore" });
      }

      // Otherwise treat as JSON fallback format
      const buf = await readFile(found.filePath);
      let jsonStr: string;
      try {
        const zlib = await import("zlib");
        const gunzip = promisify(zlib.gunzip);
        const out = await gunzip(buf);
        jsonStr = out.toString("utf-8");
      } catch {
        jsonStr = buf.toString("utf-8");
      }
      const snapshot = JSON.parse(jsonStr);
      const restored = await this.restoreFromJson(snapshot);
      await writeAudit({ action: "update", resource: "backup.restore", resourceId: id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, metadata: { method: "json", ...restored } });
      return success(restored);
    } catch (e: any) {
      return failure("RESTORE_FAILED", e?.message || "Failed to restore backup");
    }
  }

  private async buildJsonSnapshot() {
    const tablesRes: any = await db.execute(sql`SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name;`);
    const rows: Array<{ table_schema: string; table_name: string }> = (tablesRes as any).rows ?? (tablesRes as any);
    const tables: Record<string, any[]> = {};
    for (const t of rows) {
      const full = `"${t.table_schema}"."${t.table_name}"`;
      const dataRes: any = await db.execute(sql.raw(`SELECT * FROM ${full}`));
      const data = (dataRes as any).rows ?? (dataRes as any);
      tables[`${t.table_schema}.${t.table_name}`] = data || [];
    }
    return { version: 1, createdAt: new Date().toISOString(), app: "studio-admin", tables };
  }

  private async restoreFromJson(snapshot: any) {
    if (!snapshot?.tables) return { restoredTables: 0, rows: 0 };
    const tableNames = Object.keys(snapshot.tables);
    let totalRows = 0;
    // Try to relax constraints if possible
    try {
      await db.execute(sql.raw("SET session_replication_role = 'replica'"));
    } catch {}
    try {
      await db.execute(sql.raw("BEGIN"));
      for (const name of tableNames) {
        const [schemaName, tableName] = name.split(".");
        const full = `"${schemaName}"."${tableName}"`;
        const rows: any[] = snapshot.tables[name] || [];
        // fetch actual columns for this table
        const colsRes: any = await db.execute(sql`SELECT column_name, data_type, column_default, is_identity FROM information_schema.columns WHERE table_schema = ${schemaName} AND table_name = ${tableName} ORDER BY ordinal_position`);
        const colsRows: Array<{ column_name: string; data_type: string; column_default: string | null; is_identity: string | null }> = (colsRes as any).rows ?? (colsRes as any);
        const colSet = new Set((colsRows || []).map((c) => c.column_name));
        const seqCols = (colsRows || [])
          .filter((c) => c.is_identity === 'YES' || (c.column_default || '').toLowerCase().startsWith('nextval('))
          .map((c) => c.column_name);
        await db.execute(sql.raw(`TRUNCATE TABLE ${full} RESTART IDENTITY CASCADE`)).catch(() => db.execute(sql.raw(`DELETE FROM ${full}`)));
        for (const r of rows) {
          // Only insert keys that exist in the table
          const cols = Object.keys(r).filter((k) => colSet.has(k));
          if (cols.length === 0) continue;
          const valuesSql = cols.map((c) => this.toSqlLiteral(r[c])).join(",");
          const query = `INSERT INTO ${full} ("${cols.join("\",\"")}") VALUES (${valuesSql})`;
          await db.execute(sql.raw(query)).catch(() => {});
          totalRows++;
        }
        // Reset sequences/identities to MAX values
        for (const c of seqCols) {
          const reg = `"${schemaName}"."${tableName}"`;
          const resetSql = `SELECT setval(pg_get_serial_sequence('${reg}', '${c}'), GREATEST((SELECT COALESCE(MAX("${c}"), 0) FROM ${full}), 1), true)`;
          await db.execute(sql.raw(resetSql)).catch(() => {});
        }
      }
      await db.execute(sql.raw("COMMIT"));
    } catch (e) {
      try {
        await db.execute(sql.raw("ROLLBACK"));
      } catch {}
      throw e;
    } finally {
      try {
        await db.execute(sql.raw("SET session_replication_role = 'origin'"));
      } catch {}
    }
    return { restoredTables: tableNames.length, rows: totalRows };
  }

  private toSqlLiteral(v: any): string {
    if (v === null || typeof v === "undefined") return "NULL";
    if (typeof v === "number" || typeof v === "bigint") return String(v);
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (v instanceof Date) return `'${this.escapeString(v.toISOString())}'`;
    if (typeof v === "object") {
      // JSON value
      const json = JSON.stringify(v);
      return `'${this.escapeString(json)}'::jsonb`;
    }
    // fallback string
    return `'${this.escapeString(String(v))}'`;
  }

  private escapeString(s: string): string {
    return s.replace(/'/g, "''");
  }
}

export const backupsService = new BackupsService();
