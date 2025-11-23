import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { productsService } from "../services/products.service";
import { handleRouteError, successResponse } from "../utils/response";
import { requirePermission } from "../utils/rbac";
import { validateBody } from "../utils/validation";

const createVariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  compareAtPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid compare at price")
    .nullable()
    .optional(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5).optional(),
  options: z
    .record(z.string().min(1), z.string().min(1))
    .optional()
    .transform((opt: Record<string, string> | undefined) => (opt && Object.keys(opt).length ? opt : undefined)),
  image: z.string().nullable().optional(),
  isActive: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const updateVariantSchema = createVariantSchema.partial();

type CreateVariantInput = z.output<typeof createVariantSchema>;
type UpdateVariantInput = z.output<typeof updateVariantSchema>;

export class ProductVariantsController {
  static async list(request: NextRequest, productId: string) {
    try {
      await requirePermission(request, "products.manage");
      const result = await productsService.listVariants(productId);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse({ items: result.data });
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async create(request: NextRequest, productId: string) {
    try {
      await requirePermission(request, "products.manage");
      const body = await validateBody(request, createVariantSchema) as CreateVariantInput;
      const result = await productsService.createVariant(productId, body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data, 201);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async update(request: NextRequest, productId: string, variantId: string) {
    try {
      await requirePermission(request, "products.manage");
      const body = await validateBody(request, updateVariantSchema) as UpdateVariantInput;
      const result = await productsService.updateVariant(productId, variantId, body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async remove(request: NextRequest, productId: string, variantId: string) {
    try {
      await requirePermission(request, "products.manage");
      const result = await productsService.removeVariant(productId, variantId);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }
}
