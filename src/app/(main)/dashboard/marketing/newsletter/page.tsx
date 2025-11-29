import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { and, desc, eq, gte, lte, like } from "drizzle-orm";
import { NewsletterAdminClient } from "./_components/newsletter-admin-client";

export const metadata = { title: "Newsletter Subscribers" };

export default async function NewsletterSubscribersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const filters: any[] = [];
  if (q.status) filters.push(eq(schema.newsletterSubscribers.status as any, q.status as any));
  if (q.email) filters.push(like(schema.newsletterSubscribers.email, `%${q.email}%`));
  if (q.from) filters.push(gte(schema.newsletterSubscribers.createdAt as any, new Date(q.from)));
  if (q.to) filters.push(lte(schema.newsletterSubscribers.createdAt as any, new Date(q.to)));
  const where = filters.length ? and(...filters) : undefined;

  const items = await db
    .select({
      id: schema.newsletterSubscribers.id,
      email: schema.newsletterSubscribers.email,
      name: schema.newsletterSubscribers.name,
      status: schema.newsletterSubscribers.status,
      createdAt: schema.newsletterSubscribers.createdAt,
    })
    .from(schema.newsletterSubscribers)
    .where(where as any)
    .orderBy(desc(schema.newsletterSubscribers.createdAt))
    .limit(200);

  type Item = {
    id: string;
    email: string;
    name: string | null;
    status: string;
    createdAt: Date | null;
  };

  const serializedItems = (items as Item[]).map((i: Item) => ({
    ...i,
    createdAt: i.createdAt?.toISOString?.() || "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
        <p className="text-sm text-muted-foreground">Filter, export CSV, bulk actions, and manual add.</p>
      </div>

      <NewsletterAdminClient items={serializedItems} query={q} />
    </div>
  );
}
