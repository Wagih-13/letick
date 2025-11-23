"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Package, MapPin, CreditCard, Truck, ChevronDown, ChevronUp } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [itemsExpanded, setItemsExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;
    params.then(async (p) => {
      if (!mounted) return;
      setOrderId(p.id);
      try {
        setLoading(true);
        const res = await fetch(`/api/storefront/orders/${encodeURIComponent(p.id)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.error?.message || "Failed to load order");
        if (mounted) setOrder(data.data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "outline",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading order...</div>;
  }
  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }
  if (!order) {
    return <div className="text-sm text-muted-foreground">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/account/orders">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      {/* Order Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
          <p className="text-muted-foreground">
            Placed on {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          <Link href={`/account/orders/${order.orderNumber || order.id}/invoice`} target="_blank">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setItemsExpanded((v) => !v)}
              className="px-2"
            >
              {itemsExpanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" /> Hide items ({order.items.length})
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" /> Show items ({order.items.length})
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {itemsExpanded && (
            <>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <Link href={item.productSlug ? `/product/${item.productSlug}` : item.productId ? `/product/${item.productId}` : "#"} className="relative h-20 w-20 rounded bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={item.productSlug ? `/product/${item.productSlug}` : item.productId ? `/product/${item.productId}` : "#"} className="font-semibold hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.variant || ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                      <p className="text-sm mt-1">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${Number(order.shipping || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {order.shippingAddress ? (
              <>
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </>
            ) : (
              <p className="text-muted-foreground">No shipping address on file</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="capitalize">
              {order.paymentMethod === "cash_on_delivery"
                ? "Cash on Delivery"
                : order.paymentMethod === "credit_card"
                ? "Credit/Debit Card"
                : order.paymentMethod || "Payment"}
            </p>
            <Badge variant="outline" className="mt-2">
              {order.paymentStatus === "paid" ? "Paid" : "Pending"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Shipping & Tracking */}
      {Array.isArray(order.shipments) && order.shipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.shipments.map((s: any) => (
                <div key={s.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{s.methodName || "Shipping"}</p>
                    <Badge variant="outline" className="capitalize">{s.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {s.carrier || "—"} {s.trackingNumber ? `• ${s.trackingNumber}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
