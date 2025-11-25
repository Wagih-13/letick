import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

export const runtime = "nodejs";

const bodySchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const json = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = bodySchema.parse(json || {});

    const [user] = await db
      .select({ id: schema.users.id, password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });
    }

    const ok = await bcrypt.compare(currentPassword, (user as any).password);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: { message: "Current password is incorrect" } },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db
      .update(schema.users)
      .set({ password: hashed as any, updatedAt: new Date() as any })
      .where(eq(schema.users.id, session.user.id));

    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: e.errors } },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: { message: e?.message || "Failed to update password" } },
      { status: 500 },
    );
  }
}
