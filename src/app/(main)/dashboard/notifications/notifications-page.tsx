"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { RefreshCcw, Bell, Inbox, CheckCircle2, Archive, Users, Calendar, Percent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getNotificationColumns, getBroadcastColumns, type NotificationRow, type BroadcastRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<(NotificationRow | BroadcastRow)[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<any | null>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [type, setType] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: "system_alert", title: "", message: "", actionUrl: "" });
  const [roles, setRoles] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedRoleSlugs, setSelectedRoleSlugs] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState(false);

  const columns = useMemo<ColumnDef<NotificationRow | BroadcastRow, any>[]>(() => {
    if (scope === "all") {
      return getBroadcastColumns() as unknown as ColumnDef<NotificationRow | BroadcastRow, any>[];
    }
    return getNotificationColumns({
      onMarkRead: async (row) => {
        try {
          const res = await fetch(`/api/v1/notifications/${row.id}/read`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error?.message || "Failed to mark as read");
          toast.success("Marked as read");
          void fetchNotifications();
        } catch (e: any) {
          toast.error(e.message || "Action failed");
        }
      },
      onArchive: async (row) => {
        try {
          const res = await fetch(`/api/v1/notifications/${row.id}/archive`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error?.message || "Failed to archive");
          toast.success("Archived");
          void fetchNotifications();
        } catch (e: any) {
          toast.error(e.message || "Action failed");
        }
      },
      onDelete: async (row) => {
        const yes = confirm(`Delete notification?`);
        if (!yes) return;
        try {
          const res = await fetch(`/api/v1/notifications/${row.id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
          toast.success("Deleted");
          void fetchNotifications();
        } catch (e: any) {
          toast.error(e.message || "Delete failed");
        }
      },
    }) as unknown as ColumnDef<NotificationRow | BroadcastRow, any>[];
  }, [scope]);

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (scope) params.set("scope", scope);
      const res = await fetch(`/api/v1/notifications/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
    } catch {}
  }

  const table = useDataTableInstance({
    data: items,
    columns: columns as any,
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
    void fetchNotifications();
    void fetchMetrics();
  }, [pageIndex, pageSize, status, type, scope]);

  useEffect(() => {
    if (scope === "all") {
      setStatus(undefined);
    }
  }, [scope]);

  async function fetchRoles() {
    try {
      const res = await fetch(`/api/v1/roles?page=1&limit=100`);
      if (!res.ok) return;
      const data = await res.json();
      const items = data?.data?.items || data?.items || [];
      setRoles(items.map((r: any) => ({ id: r.id, name: r.name, slug: r.slug })));
    } catch {}
  }

  useEffect(() => {
    void fetchRoles();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (scope) params.set("scope", scope);
      const res = await fetch(`/api/v1/notifications?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load notifications");
      setItems((data.data?.items || []).map((r: any) => ({ ...r })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/notifications/mark-all`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to mark all");
      toast.success(`Marked ${data.data?.count ?? 0} as read`);
      void fetchNotifications();
    } catch (e: any) {
      toast.error(e.message || "Failed to mark all");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total</div>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.total ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Unread</div>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.unread ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Read</div>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.read ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Archived</div>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.archived ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">New (30d)</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.last30d ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Users</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.distinctUsers != null ? Number(metrics.distinctUsers) : (scope === 'all' ? 0 : '—')}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Read rate</div>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.readRate ?? 0)}%</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchNotifications()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          {scope !== "all" && (
            <Button variant="secondary" onClick={() => void markAllRead()} disabled={loading}>
              Mark all read
            </Button>
          )}
          <Button onClick={() => setOpen(true)} disabled={loading}>
            Send to Role
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchNotifications()} className="w-48" />
          <Select value={scope} onValueChange={(v) => setScope(v as any)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Scope" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mine">My notifications</SelectItem>
              <SelectItem value="all">All users</SelectItem>
            </SelectContent>
          </Select>
          {scope !== "all" && (
            <Select value={status} onValueChange={(v) => setStatus(v || undefined)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Input placeholder="Type (e.g. system_alert)" value={type || ""} onChange={(e) => setType(e.target.value || undefined)} className="w-56" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : setOpen(false))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Notification to Role</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="all-users" checked={allUsers} onCheckedChange={(v) => setAllUsers(Boolean(v))} />
              <Label htmlFor="all-users">All users</Label>
            </div>
            {!allUsers && (
              <div className="grid gap-2">
                <Label>Select roles</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedRoleSlugs.includes(r.slug)}
                        onCheckedChange={(v) =>
                          setSelectedRoleSlugs((prev) => (Boolean(v) ? Array.from(new Set([...prev, r.slug])) : prev.filter((s) => s !== r.slug)))
                        }
                      />
                      {r.name} <span className="text-muted-foreground">({r.slug})</span>
                    </label>
                  ))}
                </div>
                {roles.length === 0 && <span className="text-xs text-muted-foreground">No roles loaded. Ensure you have permission to list roles.</span>}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_alert">system_alert</SelectItem>
                    <SelectItem value="promotional">promotional</SelectItem>
                    <SelectItem value="order_created">order_created</SelectItem>
                    <SelectItem value="order_updated">order_updated</SelectItem>
                    <SelectItem value="order_shipped">order_shipped</SelectItem>
                    <SelectItem value="order_delivered">order_delivered</SelectItem>
                    <SelectItem value="product_review">product_review</SelectItem>
                    <SelectItem value="low_stock">low_stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action URL (optional)</Label>
                <Input value={form.actionUrl} onChange={(e) => setForm({ ...form, actionUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-32" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={async () => {
                if (!form.title || !form.message) {
                  toast.error("Title and message are required");
                  return;
                }
                if (!allUsers && selectedRoleSlugs.length === 0) {
                  toast.error("Select at least one role or choose All users");
                  return;
                }
                try {
                  setSubmitting(true);
                  const payload: any = { type: form.type || "system_alert", title: form.title, message: form.message };
                  if (allUsers) payload.all = true; else payload.roleSlugs = selectedRoleSlugs;
                  if (form.actionUrl) payload.actionUrl = form.actionUrl;
                  const res = await fetch(`/api/v1/notifications/broadcast/role`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error?.message || "Send failed");
                  toast.success(`Sent to ${data?.data?.count ?? 0} users`);
                  setOpen(false);
                  setForm({ type: "system_alert", title: "", message: "", actionUrl: "" });
                  setSelectedRoleSlugs([]);
                  setAllUsers(false);
                  void fetchNotifications();
                } catch (e: any) {
                  toast.error(e.message || "Send failed");
                } finally {
                  setSubmitting(false);
                }
              }} disabled={submitting}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
