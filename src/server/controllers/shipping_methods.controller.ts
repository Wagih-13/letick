import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { shippingMethodsService } from "../services/shipping_methods.service";
import { handleRouteError, successResponse } from "../utils/response";
import { requirePermission } from "../utils/rbac";
import { validateBody, validateQuery } from "../utils/validation";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sort: z.enum(["createdAt.desc", "createdAt.asc"]).optional(),
});

const upsertSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  carrier: z.string().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  estimatedDays: z.coerce.number().int().nullable().optional(),
  isActive: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export class ShippingMethodsController {
  static async list(request: NextRequest) {
    try {
      await requirePermission(request, "shipping.manage");
      const query = validateQuery(request.nextUrl.searchParams, listQuerySchema);
      const result = await shippingMethodsService.list(query);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async create(request: NextRequest) {
    try {
      await requirePermission(request, "shipping.manage");
      const body = await validateBody(request, upsertSchema);
      const result = await shippingMethodsService.create(body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data, 201);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async get(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "shipping.manage");
      const result = await shippingMethodsService.get(id);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async update(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "shipping.manage");
      const body = await validateBody(request, upsertSchema);
      const result = await shippingMethodsService.update(id, body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async remove(request: NextRequest, id: string) {
    try {
      await requirePermission(request, "shipping.manage");
      const result = await shippingMethodsService.remove(id);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }
}
