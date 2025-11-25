import { NextResponse } from "next/server";
import { emailsService } from "@/server/services/emails.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String((body as any)?.email || "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email address" } },
        { status: 400 },
      );
    }

    const to = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_USER || process.env.EMAIL_FROM || "";
    if (!to) {
      return NextResponse.json(
        { success: false, error: { message: "Notification recipient not configured" } },
        { status: 500 },
      );
    }

    const subject = "New newsletter subscriber";
    const html = `<p>You have a new subscriber:</p><p><strong>${email}</strong></p>`;
    const res = await emailsService.send({
      to,
      subject,
      html,
      fromOverride: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
      metadata: { type: "newsletter.subscribe", subscriber: email },
    }, undefined);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: { message: res.error.message, code: res.error.code } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { email } });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { message: e?.message || "Subscription failed" } },
      { status: 500 },
    );
  }
}
