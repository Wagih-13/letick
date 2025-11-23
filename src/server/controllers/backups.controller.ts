import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { backupsService } from "../services/backups.service";
import { handleRouteError, successResponse } from "../utils/response";
import { requirePermission } from "../utils/rbac";
import { readFile } from "fs/promises";

const listQuerySchema = z.object({ page: z.coerce.number().int().positive().optional(), limit: z.coerce.number().int().positive().max(100).optional(), sort: z.enum(["createdAt.desc", "createdAt.asc"]).optional() });
const retentionSchema = z.object({ keepLast: z.coerce.number().int().nonnegative().optional(), maxAgeDays: z.coerce.number().int().positive().optional() });

export class BackupsController {
  static async list(request: NextRequest) {
    try {
      await requirePermission(request, "backups.manage");
      const page = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
      const result = await backupsService.list(page);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async create(request: NextRequest) {
    try {
      const session = await requirePermission(request, "backups.manage");
      const result = await backupsService.create({}, { userId: (session.user as any)?.id, ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"), userAgent: request.headers.get("user-agent") });
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data, 201);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async remove(request: NextRequest, id: string) {
    try {
      const session = await requirePermission(request, "backups.manage");
      const result = await backupsService.remove(id, { userId: (session.user as any)?.id, ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"), userAgent: request.headers.get("user-agent") });
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async finalize(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "backups.manage");
      const result = await backupsService.finalize(id);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async retention(request: NextRequest) {
    try {
      await requirePermission(request, "backups.manage");
      const body = await request.json().catch(() => ({}));
      const input = retentionSchema.parse(body || {});
      const result = await backupsService.retention(input);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async download(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "backups.manage");
      const found = await backupsService.findById(id);
      if (!found.success) return NextResponse.json({ success: false, error: found.error }, { status: 404 });
      const filePath = (found.data as any).filePath as string;
      try {
        const buf = await readFile(filePath);
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${(found.data as any).fileName}"`,
          },
        });
      } catch {
        return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Backup file not found" } }, { status: 404 });
      }
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async restore(request: NextRequest, id: string) {
    try {
      const session = await requirePermission(request, "backups.manage");
      const result = await backupsService.restore(id, { userId: (session.user as any)?.id, ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"), userAgent: request.headers.get("user-agent") });
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }
}
