import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { eq, sql } from "drizzle-orm";

const RATE_WINDOW_MS = 10_000; // 10s window
const rateMap = new Map<string, number>();

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Simple IP rate limit
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0] || request.headers.get("x-real-ip") || "unknown";
    const key = `${ip}:report`;
    const now = Date.now();
    const last = rateMap.get(key) || 0;
    if (now - last < RATE_WINDOW_MS) {
      return NextResponse.json({ success: false, error: { message: "Too many requests" } }, { status: 429 });
    }

    // Cookie-based dedup
    const cookieName = "sf_rev_report";
    const cookieVal = request.cookies.get(cookieName)?.value || "";
    const seen = new Set(cookieVal.split(",").filter(Boolean));
    if (seen.has(id)) {
      return NextResponse.json({ success: true, data: { already: true } });
    }

    const [row] = await db
      .update(schema.productReviews)
      .set({ reportCount: sql`${schema.productReviews.reportCount} + 1` as any })
      .where(eq(schema.productReviews.id, id))
      .returning({ id: schema.productReviews.id, reportCount: schema.productReviews.reportCount });

    if (!row) {
      return NextResponse.json({ success: false, error: { message: "Review not found" } }, { status: 404 });
    }

    // Update rate limit and cookie
    rateMap.set(key, now);
    seen.add(id);
    const res = NextResponse.json({ success: true, data: row });
    res.cookies.set(cookieName, Array.from(seen).join(","), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { message: e?.message || "Failed to report review" } },
      { status: 500 }
    );
  }
}
