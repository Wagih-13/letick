import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { categoriesService } from "../services/categories.service";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { sql } from "drizzle-orm";
import { handleRouteError, successResponse } from "../utils/response";
import { requirePermission } from "../utils/rbac";
import { validateBody, validateQuery } from "../utils/validation";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sort: z.enum(["createdAt.desc", "createdAt.asc"]).optional(),
});

const upsertSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  image: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => v == null || v === null || typeof v === "string" && (v.startsWith("/") || /^https?:\/\//.test(v)),
      { message: "Invalid image URL" },
    ),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export class CategoriesController {
  static async list(request: NextRequest) {
    try {
      await requirePermission(request, "categories.manage");
      const query = validateQuery(request.nextUrl.searchParams, listQuerySchema);
      const result = await categoriesService.list(query);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async create(request: NextRequest) {
    try {
      await requirePermission(request, "categories.manage");
      const body = await validateBody(request, upsertSchema);
      const result = await categoriesService.create(body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data, 201);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async get(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "categories.manage");
      const result = await categoriesService.get(id);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async update(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "categories.manage");
      const body = await validateBody(request, upsertSchema);
      const result = await categoriesService.update(id, body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async remove(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "categories.manage");
      const result = await categoriesService.remove(id);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async metrics(request: NextRequest) {
    try {
      await requirePermission(request, "categories.manage");
      const query = validateQuery(request.nextUrl.searchParams, listQuerySchema);

      const filters: any[] = [];
      if (query.q) {
        const like = `%${query.q}%`;
        filters.push(sql`(${schema.categories.name} ILIKE ${like} OR ${schema.categories.slug} ILIKE ${like})`);
      }
      if (typeof query.isActive === "boolean") filters.push(sql`${schema.categories.isActive} = ${query.isActive}`);
      if (typeof query.parentId !== "undefined") {
        // When client passes parentId as string 'null', treat as IS NULL
        const p = (request.nextUrl.searchParams.get("parentId") || undefined) as string | undefined;
        if (p === "null") {
          filters.push(sql`${schema.categories.parentId} IS NULL`);
        } else if (p) {
          filters.push(sql`${schema.categories.parentId} = ${p}`);
        }
      }
      const where = filters.length ? sql.join(filters, sql` AND `) : undefined;

      const [{ totalCategories }] = await db
        .select({ totalCategories: sql<number>`count(*)` })
        .from(schema.categories)
        .where(where as any);

      const [{ activeCategories }] = await db
        .select({ activeCategories: sql<number>`count(*)` })
        .from(schema.categories)
        .where(sql`${schema.categories.isActive} = true AND ${where ? sql`(${where})` : sql`true`}` as any);

      const [{ rootCategories }] = await db
        .select({ rootCategories: sql<number>`count(*)` })
        .from(schema.categories)
        .where(sql`${schema.categories.parentId} IS NULL AND ${where ? sql`(${where})` : sql`true`}` as any);

      const [{ childCategories }] = await db
        .select({ childCategories: sql<number>`count(*)` })
        .from(schema.categories)
        .where(sql`${schema.categories.parentId} IS NOT NULL AND ${where ? sql`(${where})` : sql`true`}` as any);

      const [{ withImage }] = await db
        .select({ withImage: sql<number>`count(*)` })
        .from(schema.categories)
        .where(sql`${schema.categories.image} IS NOT NULL AND ${schema.categories.image} <> '' AND ${where ? sql`(${where})` : sql`true`}` as any);

      const inactiveCategories = Number(totalCategories || 0) - Number(activeCategories || 0);

      return successResponse({
        totalCategories: Number(totalCategories || 0),
        activeCategories: Number(activeCategories || 0),
        inactiveCategories: inactiveCategories < 0 ? 0 : inactiveCategories,
        rootCategories: Number(rootCategories || 0),
        childCategories: Number(childCategories || 0),
        withImage: Number(withImage || 0),
      });
    } catch (e) {
      return handleRouteError(e);
    }
  }
}
