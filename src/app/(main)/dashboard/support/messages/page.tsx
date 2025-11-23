import Link from "next/link";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { and, desc, eq, gte, lte, like } from "drizzle-orm";

export const metadata = { title: "Contact Messages" };

export default async function ContactMessagesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const filters: any[] = [];
  if (q.status) filters.push(eq(schema.contactMessages.status as any, q.status as any));
  if (q.email) filters.push(like(schema.contactMessages.email, `%${q.email}%`));
  if (q.from) filters.push(gte(schema.contactMessages.createdAt as any, new Date(q.from)));
  if (q.to) filters.push(lte(schema.contactMessages.createdAt as any, new Date(q.to)));
  const where = filters.length ? and(...filters) : undefined;

  const items = await db
    .select({
      id: schema.contactMessages.id,
      name: schema.contactMessages.name,
      email: schema.contactMessages.email,
      subject: schema.contactMessages.subject,
      status: schema.contactMessages.status,
      priority: schema.contactMessages.priority,
      createdAt: schema.contactMessages.createdAt,
      respondedAt: schema.contactMessages.respondedAt,
    })
    .from(schema.contactMessages)
    .where(where as any)
    .orderBy(desc(schema.contactMessages.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">Latest 100 messages from the storefront contact form.</p>
      </div>

      <form className="flex flex-wrap gap-2 mb-3" action="/dashboard/support/messages" method="get">
        <input name="email" placeholder="Email" defaultValue={q.email || ""} className="border rounded px-2 py-1" />
        <select name="status" defaultValue={q.status || ""} className="border rounded px-2 py-1">
          <option value="">All statuses</option>
          <option value="new">new</option>
          <option value="open">open</option>
          <option value="closed">closed</option>
          <option value="spam">spam</option>
        </select>
        <input type="date" name="from" defaultValue={q.from || ""} className="border rounded px-2 py-1" />
        <input type="date" name="to" defaultValue={q.to || ""} className="border rounded px-2 py-1" />
        <button className="border rounded px-3 py-1">Filter</button>
        <a className="border rounded px-3 py-1" href={`/api/v1/support/messages/export?${new URLSearchParams(q as any).toString()}`}>Export CSV</a>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Subject</th>
              <th className="px-3 py-2 text-left">From</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Priority</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Responded</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">
                  <Link href={`/dashboard/support/messages/${r.id}`}>{r.subject || "(no subject)"}</Link>
                </td>
                <td className="px-3 py-2">{r.name ? `${r.name} <${r.email}>` : r.email}</td>
                <td className="px-3 py-2 capitalize">{String(r.status)}</td>
                <td className="px-3 py-2 capitalize">{String(r.priority)}</td>
                <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">{r.respondedAt ? new Date(r.respondedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
