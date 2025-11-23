import { NextRequest, NextResponse } from "next/server";
// No DB operations here; we only clear cookies to detach browser from any cart.

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    // Remove cart cookies so a fresh empty cart is created next time (guest) or refetched (user)
    res.cookies.set("cart_id", "", { maxAge: 0, httpOnly: true, sameSite: "lax" });
    res.cookies.set("cart_session_id", "", { maxAge: 0, httpOnly: true, sameSite: "lax" });

    return res;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Failed to clear cart",
        },
      },
      { status: 500 }
    );
  }
}
