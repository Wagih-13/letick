import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import { productsService } from "../services/products.service";
import { handleRouteError, successResponse } from "../utils/response";
import { requirePermission } from "../utils/rbac";
import { validateBody } from "../utils/validation";

const addImagesSchema = z.object({
  items: z
    .array(
      z.object({
        url: z.string().min(1),
        altText: z.string().nullable().optional(),
      }),
    )
    .min(1),
});

const updateImageSchema = z.object({
  altText: z.string().nullable().optional(),
  isPrimary: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export class ProductMediaController {
  static async list(request: NextRequest, productId: string) {
    try {
      await requirePermission(request, "products.manage");
      const result = await productsService.listImages(productId);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse({ items: result.data });
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async add(request: NextRequest, productId: string) {
    try {
      await requirePermission(request, "products.manage");
      const body = await validateBody(request, addImagesSchema);
      const result = await productsService.addImages(productId, body.items);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse({ items: result.data }, 201);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async update(request: NextRequest, productId: string, imageId: string) {
    try {
      await requirePermission(request, "products.manage");
      const body = await validateBody(request, updateImageSchema);
      const result = await productsService.updateImage(productId, imageId, body);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async remove(request: NextRequest, productId: string, imageId: string) {
    try {
      await requirePermission(request, "products.manage");
      const result = await productsService.removeImage(productId, imageId);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      // Best-effort: if url is under public/uploads, delete file
      const url = result.data.url;
      if (url && url.startsWith("/uploads/")) {
        const abs = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
        try {
          await fs.unlink(abs);
        } catch {}
      }
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }
}
