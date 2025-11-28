"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCcw, ShoppingCart, DollarSign, TrendingUp, CreditCard, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { getOrderColumns, type OrderRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function OrdersPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<any | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [form, setForm] = useState({ status: "pending", paymentStatus: "pending", adminNote: "" });

  // Optional filter coming from Customers page
  const searchParams = useSearchParams();
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  useEffect(() => {
    const uid = searchParams.get("userId") || "";
    setUserIdFilter(uid);
  }, [searchParams]);

  // Details sheet state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  async function openDetails(row: OrderRow) {
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/v1/orders/${row.id}/details`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load order details");
      setDetail(data.data || null);
      setDetailOpen(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to load order details");
    } finally {
      setDetailLoading(false);
    }
  }

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status !== "all") params.set("status", status);
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (userIdFilter) params.set("userId", userIdFilter);
      const res = await fetch(`/api/v1/orders/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
    } catch {}
  }

  const columns = useMemo(
    () =>
      getOrderColumns({
        onView: (row) => {
          void openDetails(row);
        },
        onEdit: (row) => { 
          setEditing(row);
          setForm({ status: row.status, paymentStatus: row.paymentStatus, adminNote: "" });
          setOpen(true);
        },
        onDelete: async (row) => {
          const yes = confirm(`Delete order #${row.orderNumber}?`);
          if (!yes) return;
          try {
            const res = await fetch(`/api/v1/orders/${row.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
            toast.success("Order deleted");
            void fetchOrders();
          } catch (e: any) {
            toast.error(e.message || "Delete failed");
          }
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: items,
    columns,
    manualPagination: true,
    defaultPageIndex: pageIndex,
    defaultPageSize: pageSize,
    pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    getRowId: (row) => row.id,
    onPaginationChange: ({ pageIndex: pi, pageSize: ps }) => {
      setPageIndex(pi);
      setPageSize(ps);
    },
  });

  useEffect(() => {
    void fetchOrders();
    void fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, paymentStatus, dateFrom, dateTo, pageIndex, pageSize, userIdFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status !== "all") params.set("status", status);
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (userIdFilter) params.set("userId", userIdFilter);
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load orders");
      setItems((data.data?.items || []).map((o: any) => ({ ...o })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit() {
    if (!editing) return;
    try {
      const payload: any = { status: form.status, paymentStatus: form.paymentStatus, adminNote: form.adminNote || null };
      const res = await fetch(`/api/v1/orders/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Update failed");
      toast.success("Order updated");
      setOpen(false);
      void fetchOrders();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total orders</div>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.totalOrders ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Revenue</div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: metrics?.currency || "EGY" }).format(Number(metrics?.revenueTotal ?? 0))}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Avg order value</div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: metrics?.currency || "EGY" }).format(Number(metrics?.avgOrderValue ?? 0))}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Orders (30d)</div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.orders30d ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Revenue (30d)</div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: metrics?.currency || "EGY" }).format(Number(metrics?.revenue30d ?? 0))}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Paid orders</div>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.paidOrders ?? 0)}</div>
          <div className="text-xs text-muted-foreground">{typeof metrics?.pendingOrders === 'number' ? `Pending ${metrics.pendingOrders}` : "\u00A0"} {typeof metrics?.refundedOrders === 'number' ? `• Refunded ${metrics.refundedOrders}` : ""}</div>
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Order number or email" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Payment</Label>
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Date from</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Date to</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 items-end">
          {userIdFilter && (
            <div className="text-xs text-muted-foreground mr-2">
              Filtered by customer: <code className="text-xs">{userIdFilter}</code>
            </div>
          )}
          <Button variant="outline" onClick={() => void fetchOrders()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />

      {/* Edit dialog */}
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : setOpen(false))}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Payment</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => setForm((s) => ({ ...s, paymentStatus: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Admin Note</Label>
              <Input value={form.adminNote} onChange={(e) => setForm((s) => ({ ...s, adminNote: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void onSubmit()} disabled={loading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details drawer */}
      <Sheet open={detailOpen} onOpenChange={(o) => setDetailOpen(o)}>
        <SheetContent side="right" className="w-full sm:max-w-xl max-h-[100dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {detail ? `Order #${detail.order?.orderNumber}` : "Order details"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-4">
            {detailLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
            {!detailLoading && detail && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">{detail.order?.status}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Payment</div>
                    <div className="font-medium capitalize">{detail.order?.paymentStatus}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Customer</div>
                    <div className="font-medium">
                      {(() => {
                        const fn = (detail.order as any)?.customerFirstName || (detail.shippingAddress?.firstName ?? "");
                        const ln = (detail.order as any)?.customerLastName || (detail.shippingAddress?.lastName ?? "");
                        const full = `${fn} ${ln}`.trim();
                        const email = detail.order?.customerEmail || detail.shippingAddress?.email;
                        const phone = detail.order?.customerPhone || detail.shippingAddress?.phone;
                        if (full) return full;
                        if (email) return email;
                        if (phone) return phone;
                        return "—";
                      })()}
                    </div>
                    {(detail.order?.customerEmail || detail.shippingAddress?.email) && (
                      <div className="text-xs text-muted-foreground mt-0.5">{detail.order?.customerEmail || detail.shippingAddress?.email}</div>
                    )}
                    {(detail.order?.customerPhone || detail.shippingAddress?.phone) && (
                      <div className="text-xs text-muted-foreground">{detail.order?.customerPhone || detail.shippingAddress?.phone}</div>
                    )}
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-medium">{detail.order?.currency} {detail.order?.totalAmount}</div>
                  </div>
                </div>

                {/* Shipping address snapshot */}
                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold">Shipping Address</div>
                  <div className="rounded-md border p-3 text-sm">
                    {detail.shippingAddress ? (
                      <div className="space-y-0.5">
                        <div className="font-medium">{`${detail.shippingAddress.firstName} ${detail.shippingAddress.lastName}`.trim()}</div>
                        <div>{detail.shippingAddress.addressLine1}</div>
                        {detail.shippingAddress.addressLine2 && <div>{detail.shippingAddress.addressLine2}</div>}
                        <div>
                          {detail.shippingAddress.city}, {detail.shippingAddress.state} {detail.shippingAddress.postalCode}
                        </div>
                        <div>{detail.shippingAddress.country}</div>
                        {detail.shippingAddress.phone && (
                          <div className="text-xs text-muted-foreground">Phone: {detail.shippingAddress.phone}</div>
                        )}
                        {detail.shippingAddress.email && (
                          <div className="text-xs text-muted-foreground">Email: {detail.shippingAddress.email}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No address on file</div>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="mb-2 text-sm font-semibold">Items</div>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 gap-2 border-b p-2 text-xs text-muted-foreground">
                      <div className="col-span-3">Product</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Price</div>
                      <div className="text-right">Total</div>
                    </div>
                    {(detail.items || []).map((it: any) => (
                      <div key={it.id} className="grid grid-cols-6 gap-2 p-2 text-sm">
                        <div className="col-span-3">
                          <div className="font-medium">{it.productName}</div>
                          {it.variantName && (
                            <div className="text-xs text-muted-foreground">{it.variantName}</div>
                          )}
                          {it.sku && <div className="text-xs text-muted-foreground">SKU: {it.sku}</div>}
                        </div>
                        <div className="text-right">{it.quantity}</div>
                        <div className="text-right">{detail.order?.currency} {it.unitPrice}</div>
                        <div className="text-right">{detail.order?.currency} {it.totalPrice}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold">Shipments</div>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-2 border-b p-2 text-xs text-muted-foreground">
                      <div>Method</div>
                      <div>Tracking</div>
                      <div>Status</div>
                      <div className="text-right">Shipped</div>
                      <div className="text-right">ETA</div>
                    </div>
                    {(detail.shipments || []).map((s: any) => (
                      <div key={s.id} className="grid grid-cols-5 gap-2 p-2 text-sm">
                        <div>{s.methodName || "—"}</div>
                        <div>{s.trackingNumber || "—"}</div>
                        <div className="capitalize">{s.status}</div>
                        <div className="text-right">{s.shippedAt ? new Date(s.shippedAt).toLocaleString() : "—"}</div>
                        <div className="text-right">{s.estimatedDeliveryAt ? new Date(s.estimatedDeliveryAt).toLocaleDateString() : "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
