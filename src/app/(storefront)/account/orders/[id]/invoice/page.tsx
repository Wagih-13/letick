"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer } from "lucide-react";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(async (p) => {
      if (!mounted) return;
      setId(p.id);
      try {
        setLoading(true);
        const res = await fetch(`/api/storefront/orders/${encodeURIComponent(p.id)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.error?.message || "Failed to load invoice");
        if (mounted) setOrder(data.data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load invoice");
      } finally {
        if (mounted) setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    return {
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),
      tax: Number(order.tax || 0),
      total: Number(order.total || 0),
    };
  }, [order]);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading invoice...</div>;
  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>;
  if (!order) return <div className="p-6 text-sm text-muted-foreground">Invoice not found</div>;

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      {/* Actions (hidden on print) */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/account/orders/${order.id || id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Order
          </Button>
        </Link>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      <div className="rounded-lg border p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/Storefront/images/logo%20(1).png" alt="Logo" width={120} height={32} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">Invoice</h1>
            <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
            <p className="text-sm">{order.orderNumber}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Addresses */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Billed To</h3>
            <div className="text-sm leading-6">
              {order.shippingAddress ? (
                <>
                  <div>{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.addressLine1}</div>
                  {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                  <div className="mt-1">{order.shippingAddress.phone}</div>
                </>
              ) : (
                <div className="text-muted-foreground">No address on file</div>
              )}
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Seller</h3>
            <div className="text-sm leading-6">
              <div>Modest Wear</div>
              <div>123 Commerce St.</div>
              <div>City, ST 12345</div>
              <div>United States</div>
              <div className="mt-1">support@example.com</div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Items */}
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-2 border-b p-2 text-xs text-muted-foreground">
            <div className="col-span-7">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-1 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {order.items.map((it: any) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 p-2 text-sm">
              <div className="col-span-7">
                <div className="font-medium">{it.name}</div>
                {it.variant && <div className="text-xs text-muted-foreground">{it.variant}</div>}
                {it.sku && <div className="text-xs text-muted-foreground">SKU: {it.sku}</div>}
              </div>
              <div className="col-span-2 text-right">{it.quantity}</div>
              <div className="col-span-1 text-right">${Number(it.price).toFixed(2)}</div>
              <div className="col-span-2 text-right">${Number(it.total).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 flex flex-col items-end gap-1 text-sm">
          <div className="flex w-full max-w-sm justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex w-full max-w-sm justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>${totals.shipping.toFixed(2)}</span>
          </div>
          <div className="flex w-full max-w-sm justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>${totals.tax.toFixed(2)}</span>
          </div>
          <Separator className="my-2 w-full max-w-sm" />
          <div className="flex w-full max-w-sm justify-between text-base font-semibold">
            <span>Total</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-muted-foreground">
          <p>Thank you for your purchase.</p>
          <p className="mt-1">If you have any questions about this invoice, please contact support.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 12mm;
          }
          header, nav, footer { display: none !important; }
          .print\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
