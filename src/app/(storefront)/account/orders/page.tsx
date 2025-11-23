"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Eye, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [orders, setOrders] = useState<Array<{
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    paymentStatus: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
      productSlug?: string | null;
      productId?: string | null;
    }>;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        params.set("page", String(page));
        params.set("limit", String(limit));
        const res = await fetch(`/api/storefront/orders?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          const payload = data?.data || { items: [], total: 0, page: 1, limit, hasMore: false };
          setOrders(Array.isArray(payload.items) ? payload.items : []);
          setHasMore(Boolean(payload.hasMore));
        }
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

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

  const filteredOrders = orders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order History</h2>
          <p className="text-muted-foreground">
            View and track your orders
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-6">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-lg font-bold">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items toggle */}
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}
                  className="px-2"
                >
                  {expanded[order.id] ? (
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

              {/* Order Items */}
              {expanded[order.id] && (
                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="relative h-16 w-16 rounded bg-muted flex-shrink-0">
                        <Image src={item.image || "/placeholder-product.jpg"} alt={item.name} fill className="object-cover rounded" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tracking info can be loaded from /api/storefront/orders/[id]/tracking if needed */}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </Link>
                <Link href={`/account/orders/${order.orderNumber || order.id}/invoice`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Invoice
                  </Button>
                </Link>
                {order.status === "delivered" && (
                  <Button variant="outline" size="sm">
                    Buy Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === "all"
                ? "You haven't placed any orders yet"
                : `No ${statusFilter} orders`}
            </p>
            <Link href="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
