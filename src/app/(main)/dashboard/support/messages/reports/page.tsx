import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { gte, desc } from "drizzle-orm";

export const metadata = { title: "Support Reports" };

function fmt(n: number) { return new Intl.NumberFormat().format(n); }
function fmtMs(ms: number) {
  if (!isFinite(ms) || ms <= 0) return "—";
  const mins = ms / 60000;
  if (mins < 60) return `${mins.toFixed(1)}m`;
  const hrs = mins / 60;
  if (hrs < 24) return `${hrs.toFixed(1)}h`;
  const days = hrs / 24;
  return `${days.toFixed(1)}d`;
}

export default async function SupportReportsPage() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      id: schema.contactMessages.id,
      status: schema.contactMessages.status,
      priority: schema.contactMessages.priority,
      createdAt: schema.contactMessages.createdAt,
      respondedAt: schema.contactMessages.respondedAt,
    })
    .from(schema.contactMessages)
    .where(gte(schema.contactMessages.createdAt as any, since30))
    .orderBy(desc(schema.contactMessages.createdAt));

  const totals = {
    total: rows.length,
    new: rows.filter(r => String(r.status) === "new").length,
    open: rows.filter(r => String(r.status) === "open").length,
    closed: rows.filter(r => String(r.status) === "closed").length,
    spam: rows.filter(r => String(r.status) === "spam").length,
  };

  const responded = rows.filter(r => r.respondedAt);
  const avgResponseMs = responded.length
    ? responded.reduce((acc, r) => acc + (new Date(r.respondedAt as any).getTime() - new Date(r.createdAt as any).getTime()), 0) / responded.length
    : 0;

  const days: { label: string; dateKey: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString(), dateKey: key, count: 0 });
  }
  for (const r of rows) {
    if (new Date(r.createdAt as any) < since14) continue;
    const key = new Date(r.createdAt as any).toISOString().slice(0, 10);
    const day = days.find((d) => d.dateKey === key);
    if (day) day.count += 1;
  }
  const maxDay = Math.max(1, ...days.map(d => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Reports</h1>
        <p className="text-sm text-muted-foreground">Last 30 days overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded border p-4"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">{fmt(totals.total)}</div></div>
        <div className="rounded border p-4"><div className="text-sm text-muted-foreground">Open</div><div className="text-2xl font-bold">{fmt(totals.open)}</div></div>
        <div className="rounded border p-4"><div className="text-sm text-muted-foreground">Closed</div><div className="text-2xl font-bold">{fmt(totals.closed)}</div></div>
        <div className="rounded border p-4"><div className="text-sm text-muted-foreground">Avg response</div><div className="text-2xl font-bold">{fmtMs(avgResponseMs)}</div></div>
      </div>

      <div className="rounded border p-4">
        <div className="mb-3 font-semibold">Last 14 days volume</div>
        <div className="grid grid-cols-14 gap-2 items-end" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-full bg-primary/20 rounded" style={{ height: `${(d.count / maxDay) * 80 + 4}px` }} />
              <div className="text-[10px] text-muted-foreground" title={d.label}>{d.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="mb-3 font-semibold">By status</div>
        <ul className="text-sm space-y-1">
          <li>new: {fmt(totals.new)}</li>
          <li>open: {fmt(totals.open)}</li>
          <li>closed: {fmt(totals.closed)}</li>
          <li>spam: {fmt(totals.spam)}</li>
        </ul>
      </div>
    </div>
  );
}
