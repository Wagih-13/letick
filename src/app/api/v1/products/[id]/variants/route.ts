import type { NextRequest } from "next/server";
import { ProductVariantsController } from "@/server/controllers/product-variants.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return ProductVariantsController.list(request, id);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return ProductVariantsController.create(request, id);
}
