import { NextResponse } from "next/server";
import { db } from "@/shared/db";
import { systemSettings } from "@/shared/db/schema/system";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const rows = await db.select().from(systemSettings).where(eq(systemSettings.isPublic, true));
    const data: Record<string, any> = {};
    for (const s of rows) {
      const type = (s as any).type || "string";
      let v: any = (s as any).value;
      if (type === "number") {
        const n = Number(v);
        v = Number.isNaN(n) ? v : n;
      } else if (type === "boolean") {
        v = String(v).toLowerCase() === "true";
      }
      data[(s as any).key] = v;
    }
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { message: e?.message || "Failed to load settings" } },
      { status: 500 }
    );
  }
}
