import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]); 
const EXT_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("avatar");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: { message: "No file uploaded" } }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: { message: "Unsupported file type" } }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: { message: "File too large (max 5MB)" } }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    try { await fs.mkdir(uploadDir, { recursive: true }); } catch {}

    const ext = EXT_FOR_TYPE[file.type] || "jpg";
    const filename = `${session.user.id}.${ext}`;
    const fullPath = path.join(uploadDir, filename);
    await fs.writeFile(fullPath, buffer);

    const publicUrl = `/uploads/avatars/${filename}`;

    const [saved] = await db
      .update(schema.users)
      .set({ avatar: publicUrl as any, updatedAt: new Date() as any })
      .where(eq(schema.users.id, session.user.id))
      .returning({ id: schema.users.id, email: schema.users.email, firstName: schema.users.firstName, lastName: schema.users.lastName, phone: schema.users.phone, avatar: schema.users.avatar });

    return NextResponse.json({ success: true, data: saved });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { message: e?.message || "Upload failed" } },
      { status: 500 },
    );
  }
}
