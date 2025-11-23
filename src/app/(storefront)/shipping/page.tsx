import type { Metadata } from "next";
import { PageHeader } from "@/components/storefront/static/page-header";
import { PageBreadcrumbs } from "@/components/storefront/static/breadcrumbs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Shipping Information" };

export default function ShippingPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-4">
        <PageBreadcrumbs items={[{ href: "/", label: "Home" }, { label: "Help" }, { label: "Shipping" }]} />
      </div>
      <PageHeader title="Shipping Information" subtitle="Clear timelines, transparent rates, and reliable tracking on every order." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border ring-1 ring-border p-5 bg-card">
          <h2 className="font-semibold mb-2">Domestic</h2>
          <p className="text-sm text-muted-foreground">2–5 business days via trusted carriers. Free shipping on orders over $75.</p>
        </div>
        <div className="rounded-xl border ring-1 ring-border p-5 bg-card">
          <h2 className="font-semibold mb-2">International</h2>
          <p className="text-sm text-muted-foreground">5–12 business days. Duties and taxes are calculated at checkout for a smooth delivery.</p>
        </div>
        <div className="rounded-xl border ring-1 ring-border p-5 bg-card">
          <h2 className="font-semibold mb-2">Tracking</h2>
          <p className="text-sm text-muted-foreground">A tracking link is emailed as soon as your order ships. Updates in real time.</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border ring-1 ring-border p-6 bg-card">
        <h2 className="font-semibold mb-4">Shipping Rates</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Standard</TableCell>
              <TableCell>2–5 business days</TableCell>
              <TableCell>$6.99 (Free over $75)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Express</TableCell>
              <TableCell>1–2 business days</TableCell>
              <TableCell>$19.99</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>International</TableCell>
              <TableCell>5–12 business days</TableCell>
              <TableCell>Calculated at checkout</TableCell>
            </TableRow>
          </TableBody>
          <TableCaption className="text-xs">Delivery timeframes are estimates once your order has shipped.</TableCaption>
        </Table>
      </div>
    </div>
  );
}
