import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { getEmailProvider } from "@/lib/email/provider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const body = await req.json().catch(() => ({} as any));
    const limit = Math.min(100, Math.max(1, Number(limitParam ?? body?.limit ?? 25)) || 25);

    const pending = await db
      .select()
      .from(schema.emailLogs)
      .where(eq(schema.emailLogs.status as any, "pending" as any))
      .limit(limit);

    if (!pending.length) {
      return NextResponse.json({ success: true, data: { processed: 0, sent: 0, failed: 0 } });
    }

    const provider = getEmailProvider();
    let sent = 0;
    let failed = 0;

    for (const row of pending) {
      try {
        const res = await provider.sendEmail({ to: (row as any).to, from: (row as any).from, subject: (row as any).subject, body: (row as any).body });
        if (res.ok) {
          await db
            .update(schema.emailLogs)
            .set({ status: "sent" as any, sentAt: new Date(), error: null })
            .where(eq(schema.emailLogs.id, (row as any).id));
          sent++;
        } else {
          await db
            .update(schema.emailLogs)
            .set({ status: "failed" as any, error: res.error || "Unknown error" })
            .where(eq(schema.emailLogs.id, (row as any).id));
          failed++;
        }
      } catch (e: any) {
        await db
          .update(schema.emailLogs)
          .set({ status: "failed" as any, error: e?.message || "Send failed" })
          .where(eq(schema.emailLogs.id, (row as any).id));
        failed++;
      }
    }

    return NextResponse.json({ success: true, data: { processed: pending.length, sent, failed } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { message: e?.message || "Failed" } }, { status: 500 });
  }
}
