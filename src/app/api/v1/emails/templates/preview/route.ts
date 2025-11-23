import { NextRequest, NextResponse } from "next/server";
import { renderTemplate } from "@/lib/email-templates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body?.slug || "").trim();
    if (!slug) return NextResponse.json({ success: false, error: { message: "Missing template slug" } }, { status: 400 });
    const variables: Record<string, any> = body?.variables || {};
    const fallbackSubject = String(body?.subject || "");
    const fallbackBody = String(body?.body || "");
    const rendered = await renderTemplate(slug, variables, fallbackSubject, fallbackBody);
    return NextResponse.json({ success: true, data: rendered });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { message: e?.message || "Failed" } }, { status: 500 });
  }
}
