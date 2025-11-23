import { db } from "@/shared/db";
import { healthChecks } from "@/shared/db/schema/system";
import { and, eq, sql } from "drizzle-orm";

export class HealthRepository {
  async list(params: { page?: number; limit?: number; sort?: "createdAt.desc" | "createdAt.asc"; service?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(200, Math.max(1, params.limit ?? 10));
    const offset = (page - 1) * limit;
    const orderBy = params.sort === "createdAt.asc" ? healthChecks.createdAt : sql`${healthChecks.createdAt} DESC`;

    const filters: any[] = [];
    if (params.service) filters.push(eq(healthChecks.service, params.service));
    const where = filters.length ? and(...filters) : undefined as any;

    const items = await db.select().from(healthChecks).where(where as any).orderBy(orderBy as any).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(healthChecks).where(where as any);
    return { items, total: count ?? 0 };
  }

  async run(service = "app") {
    const t0 = Date.now();
    // simple db ping
    await db.execute(sql`select 1 as ok` as any);
    const responseTime = Date.now() - t0;
    const [row] = await db
      .insert(healthChecks)
      .values({ service, status: "healthy" as any, responseTime, details: { db: "ok" } as any })
      .returning();
    return row;
  }
}

export const healthRepository = new HealthRepository();
