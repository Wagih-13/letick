import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { processImageUpload } from "@/server/utils/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    // Allow client to specify destination folder; default to products to preserve existing behavior
    let folder = String(formData.get("folder") || "products").toLowerCase();
    if (!folder || folder === "undefined" || folder === "null") folder = "products";
    // Normalize potential aliases
    if (folder === "profiles") folder = "avatars";
    if (!files.length) {
      return NextResponse.json({ success: false, error: { code: "NO_FILES", message: "No files uploaded" } }, { status: 400 });
    }

    // Ensure base uploads dir exists (processImageUpload also ensures its own folder)
    await fs.mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });

    const saved: Array<{ url: string; path: string; filename: string; size: number; type: string }> = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const type = f.type || "";
      if (!ALLOWED_MIME.has(type)) {
        return NextResponse.json(
          { success: false, error: { code: "UNSUPPORTED_TYPE", message: `Unsupported file type: ${type}` } },
          { status: 400 },
        );
      }
      const size = (f as any).size as number;
      if (typeof size === "number" && size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: { code: "FILE_TOO_LARGE", message: `Max file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` } },
          { status: 400 },
        );
      }

      const processed = await processImageUpload(f, folder);
      saved.push({ url: processed.url, path: processed.path, filename: processed.filename, size: processed.size, type });
    }

    return NextResponse.json({ success: true, data: { items: saved } });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_FAILED", message: e?.message || "Failed to upload files" } },
      { status: 500 },
    );
  }
}
