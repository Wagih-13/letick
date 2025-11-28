import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

function guessContentType(p: string) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const parts = Array.isArray(params.path) ? params.path : [];
    const relPath = parts.join("/");

    const baseDir = path.join(process.cwd(), "public", "uploads");
    const candidate = path.join(baseDir, relPath);
    const resolved = path.resolve(candidate);
    if (!resolved.startsWith(path.resolve(baseDir))) {
      return NextResponse.json({ success: false, error: { message: "Invalid path" } }, { status: 400 });
    }

    // Try local file under public/uploads
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const data = await fs.readFile(resolved);
      return new Response(data, {
        headers: {
          "Content-Type": guessContentType(resolved),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // ignore
    }

    // Fallback to remote origin (use NEXT_PUBLIC_APP_URL if provided)
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const remoteUrl = `${base}/uploads/${relPath}`;
    const resp = await fetch(remoteUrl);
    if (resp.ok && resp.body) {
      // Stream remote with caching
      const contentType = resp.headers.get("content-type") ?? guessContentType(remoteUrl);
      return new Response(resp.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json({ success: false, error: { message: "Not found" } }, { status: 404 });
  } catch {
    return NextResponse.json({ success: false, error: { message: "Failed" } }, { status: 500 });
  }
}
