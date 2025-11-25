import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const code = (process.env.NEXT_PUBLIC_CURRENCY || process.env.STOREFRONT_CURRENCY || "EGP").toUpperCase();
    return NextResponse.json({ success: true, data: { code } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { message: e?.message || "Failed to load currency" } }, { status: 500 });
  }
}
