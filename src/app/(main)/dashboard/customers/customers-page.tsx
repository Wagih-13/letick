"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Users, UserCheck, UserPlus, DollarSign, Repeat } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getCustomerColumns, type CustomerRow } from "./columns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const DEFAULT_LIMIT = 10;

export default function CustomersPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CustomerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState<string>("USD");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<CustomerRow | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [details, setDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    isActive: true,
  });

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onView: (row) => {
          setViewing(row);
          setDrawerOpen(true);
          void fetchCustomerOrders(row.id);
          void fetchCustomerDetails(row.id);
        },
        onDelete: async (row) => {
          const yes = confirm(`Delete customer ${row.email}?`);
          if (!yes) return;
          try {
            const res = await fetch(`/api/v1/customers/${row.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
            toast.success("Customer deleted");
            void fetchCustomers();
          } catch (e: any) {
            toast.error(e.message || "Delete failed");
          }
        },
      }, { currency }),
    [currency],
  );

  useEffect(() => {
    if (drawerOpen && viewing?.id) {
      void fetchCustomerDetails(viewing.id);
      void fetchCustomerOrders(viewing.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, viewing?.id]);

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
    void fetchCustomers();
    void fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, pageIndex, pageSize]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status !== "all") params.set("isActive", String(status === "active"));
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/customers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load customers");
      setItems((data.data?.items || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        createdAt: u.createdAt,
        ordersCount: u.ordersCount,
        totalSpent: Number(u.totalSpent ?? 0),
        avgOrderValue: Number(u.avgOrderValue ?? 0),
        lastOrderAt: u.lastOrderAt,
      })));
      setTotal(data.data?.total || 0);
      if (data.data?.currency) setCurrency(data.data.currency);
    } catch (e: any) {
      toast.error(e.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status !== "all") params.set("isActive", String(status === "active"));
      const res = await fetch(`/api/v1/customers/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
      if (data.data?.currency) setCurrency(data.data.currency);
    } catch {
      // ignore metrics errors
    }
  }

  async function fetchCustomerOrders(userId: string) {
    try {
      setOrdersLoading(true);
      const params = new URLSearchParams();
      params.set("userId", userId);
      params.set("limit", "20");
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load orders");
      setOrders(data.data?.items || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function fetchCustomerDetails(userId: string) {
    try {
      setDetailsLoading(true);
      const res = await fetch(`/api/v1/customers/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load details");
      setDetails(data.data || null);
      if (data.data?.currency) setCurrency(data.data.currency);
    } catch (e: any) {
      toast.error(e.message || "Failed to load details");
    } finally {
      setDetailsLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setForm({ email: "", password: "", firstName: "", lastName: "", isActive: true });
  }

  async function onSubmit() {
    try {
      const payload: any = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        isActive: form.isActive,
      };
      if (!editing) payload.password = form.password;
      const res = await fetch(editing ? `/api/v1/customers/${editing.id}` : "/api/v1/customers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Save failed");
      toast.success(editing ? "Customer updated" : "Customer created");
      setOpen(false);
      resetForm();
      void fetchCustomers();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total customers</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.totalCustomers ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Active customers</div>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.activeCustomers ?? "—"}</div>
          <div className="text-xs text-muted-foreground">{typeof metrics?.activeRate === 'number' ? `${metrics.activeRate}% active` : "\u00A0"}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">New last 30 days</div>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.newCustomers30d ?? "—"}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total spent</div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: metrics?.currency || currency }).format(Number(metrics?.totalSpent ?? 0))}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Avg order value</div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: metrics?.currency || currency }).format(Number(metrics?.avgOrderValue ?? 0))}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Returning customers</div>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.returningCustomers ?? "—"}</div>
          <div className="text-xs text-muted-foreground">{typeof metrics?.returningRate === 'number' ? `${metrics.returningRate}%` : "\u00A0"}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchCustomers()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : (setOpen(false), resetForm()))}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Customer" : "Create Customer"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Password{editing ? " (leave blank to keep)" : ""}</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                      placeholder={editing ? "••••••••" : "Strong password"}
                      disabled={!!editing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>First Name</Label>
                    <Input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Last Name</Label>
                    <Input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: Boolean(v) }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => (setOpen(false), resetForm())}>Cancel</Button>
                <Button onClick={() => void onSubmit()} disabled={loading}>{editing ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <DataTable
          table={table as any}
          columns={columns as any}
          onRowClick={(row: CustomerRow) => {
            setViewing(row);
            setDrawerOpen(true);
          }}
        />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />

      {/* Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={(o) => setDrawerOpen(o)}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col overflow-hidden">
          <div className="shrink-0">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle>Customer details</SheetTitle>
                  <SheetDescription>Overview and recent orders</SheetDescription>
                </div>
                {viewing && (
                  <a
                    href={`/dashboard/orders?userId=${encodeURIComponent(viewing.id)}`}
                    className="text-sm underline hover:no-underline"
                  >
                    View all orders
                  </a>
                )}
              </div>
            </SheetHeader>
          </div>
          {viewing && (
            <div className="mt-4 space-y-4 flex-1 overflow-auto no-scrollbar pr-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{(viewing.firstName || viewing.lastName) ? `${viewing.firstName ?? ""} ${viewing.lastName ?? ""}`.trim() : viewing.email}</div>
                  <div className="text-sm text-muted-foreground">{details?.user?.email || viewing.email}</div>
                  {details?.user?.phone ? (
                    <div className="text-sm text-muted-foreground">{details.user.phone}</div>
                  ) : null}
                </div>
                <Badge variant={viewing.isActive ? "default" : "secondary"} className={viewing.isActive ? "bg-green-600" : ""}>{viewing.isActive ? "Active" : "Inactive"}</Badge>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const tags: string[] = [];
                  const total = Number(details?.aggregates?.totalSpent ?? viewing.totalSpent ?? 0);
                  const ordersCount = Number(details?.aggregates?.ordersCount ?? viewing.ordersCount ?? 0);
                  const firstAt = details?.aggregates?.firstOrderAt ? new Date(details.aggregates.firstOrderAt) : null;
                  if (total >= 1000) tags.push("VIP");
                  if (ordersCount <= 2) tags.push("New");
                  if (firstAt && (Date.now() - firstAt.getTime()) / (1000*60*60*24) <= 30) tags.push("Recent");
                  return tags.length ? tags.map((t) => <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>) : null;
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Total orders</div>
                  <div className="text-xl font-semibold">{Number(details?.aggregates?.ordersCount ?? viewing.ordersCount ?? 0)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Total spent</div>
                  <div className="text-xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: details?.currency || currency }).format(Number(details?.aggregates?.totalSpent ?? viewing.totalSpent ?? 0))}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Avg order value</div>
                  <div className="text-xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: details?.currency || currency }).format(Number(details?.aggregates?.avgOrderValue ?? viewing.avgOrderValue ?? 0))}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Last order</div>
                  <div className="text-xl font-semibold">{(details?.aggregates?.lastOrderAt || viewing.lastOrderAt) ? new Date((details?.aggregates?.lastOrderAt || viewing.lastOrderAt) as any).toLocaleDateString() : "—"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">First order</div>
                  <div className="text-xl font-semibold">{details?.aggregates?.firstOrderAt ? new Date(details.aggregates.firstOrderAt as any).toLocaleDateString() : "—"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Refunded total</div>
                  <div className="text-xl font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: details?.currency || currency }).format(Number(details?.aggregates?.refundedTotal ?? 0))}</div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="mb-1 text-xs text-muted-foreground">Default shipping</div>
                  {detailsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : details?.shippingAddress ? (
                    <div className="text-sm leading-6">
                      <div className="font-medium">{details.shippingAddress.firstName} {details.shippingAddress.lastName}</div>
                      <div>{details.shippingAddress.addressLine1}</div>
                      {details.shippingAddress.addressLine2 ? <div>{details.shippingAddress.addressLine2}</div> : null}
                      <div>{details.shippingAddress.city}, {details.shippingAddress.state} {details.shippingAddress.postalCode}</div>
                      <div>{details.shippingAddress.country}</div>
                      <div className="text-muted-foreground">{details.shippingAddress.phone}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No shipping address</div>
                  )}
                </div>
                <div className="rounded-lg border p-3">
                  <div className="mb-1 text-xs text-muted-foreground">Default billing</div>
                  {detailsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : details?.billingAddress ? (
                    <div className="text-sm leading-6">
                      <div className="font-medium">{details.billingAddress.firstName} {details.billingAddress.lastName}</div>
                      <div>{details.billingAddress.addressLine1}</div>
                      {details.billingAddress.addressLine2 ? <div>{details.billingAddress.addressLine2}</div> : null}
                      <div>{details.billingAddress.city}, {details.billingAddress.state} {details.billingAddress.postalCode}</div>
                      <div>{details.billingAddress.country}</div>
                      {details.billingAddress.phone ? <div className="text-muted-foreground">{details.billingAddress.phone}</div> : null}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No billing address</div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 font-medium">Recent orders</div>
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-4 bg-muted px-3 py-2 text-xs font-medium">
                    <div>Order</div>
                    <div>Status</div>
                    <div className="text-right">Total</div>
                    <div className="text-right">Date</div>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {ordersLoading ? (
                      <div className="p-4 text-sm text-muted-foreground">Loading…</div>
                    ) : orders.length ? (
                      orders.map((o) => (
                        <div key={o.id} className="grid grid-cols-4 border-t px-3 py-2 text-sm">
                          <div className="truncate">{o.orderNumber}</div>
                          <div className="capitalize">{String(o.status)}</div>
                          <div className="text-right">{new Intl.NumberFormat(undefined, { style: "currency", currency: o.currency || details?.currency || currency }).format(Number(o.totalAmount || 0))}</div>
                          <div className="text-right text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">No orders</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
