import type { NextRequest } from "next/server";
import { ProductVariantsController } from "@/server/controllers/product-variants.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; variantId: string }> }) {
  const { id, variantId } = await context.params;
  return ProductVariantsController.update(request, id, variantId);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; variantId: string }> }) {
  const { id, variantId } = await context.params;
  return ProductVariantsController.remove(request, id, variantId);
}
