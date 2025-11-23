"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, ShieldCheck, Layers, ListChecks, Users, Ban, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getPermissionColumns, type PermissionRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function PermissionsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PermissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<any | null>(null);

  const [q, setQ] = useState("");
  const [resource, setResource] = useState<string>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PermissionRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    resource: "",
    action: "",
    description: "",
  });

  const [resources, setResources] = useState<string[]>([]);

  const columns = useMemo(
    () =>
      getPermissionColumns({
        onEdit: (row) => {
          setEditing(row);
          setForm({
            name: row.name,
            slug: row.slug,
            resource: row.resource,
            action: row.action,
            description: row.description || "",
          });
          setOpen(true);
        },
        onDelete: async (row) => {
          const yes = confirm(`Delete permission ${row.slug}?`);
          if (!yes) return;
          try {
            const res = await fetch(`/api/v1/permissions/${row.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
            toast.success("Permission deleted");
            void fetchPermissions();
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
    void fetchResources();
  }, []);

  useEffect(() => {
    void fetchPermissions();
    void fetchMetrics();
  }, [q, resource, pageIndex, pageSize]);

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (resource !== "all") params.set("resource", resource);
      const res = await fetch(`/api/v1/permissions/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
    } catch {}
  }

  async function fetchResources() {
    try {
      const res = await fetch("/api/v1/permissions/resources");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load resources");
      setResources(data.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load resources");
    }
  }

  async function fetchPermissions() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (resource !== "all") params.set("resource", resource);
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/permissions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load permissions");
      setItems((data.data?.items || []).map((p: any) => ({ ...p, createdAt: p.createdAt })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setForm({ name: "", slug: "", resource: "", action: "", description: "" });
  }

  async function onSubmit() {
    try {
      const payload: any = {
        name: form.name,
        slug: form.slug,
        resource: form.resource,
        action: form.action,
        description: form.description || null,
      };
      const res = await fetch(editing ? `/api/v1/permissions/${editing.id}` : "/api/v1/permissions", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Save failed");
      toast.success(editing ? "Permission updated" : "Permission created");
      setOpen(false);
      resetForm();
      void fetchPermissions();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total permissions</div>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.totalPermissions ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Resources</div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.distinctResources ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Actions</div>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.distinctActions ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Assigned to roles</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.assignedToRoles ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Unassigned</div>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.unassignedCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">New (30d)</div>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.newPermissions30d ?? 0)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search name or slug" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Resource</Label>
            <Select value={resource} onValueChange={(v) => setResource(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {resources.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchPermissions()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : (setOpen(false), resetForm()))}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Permission" : "Create Permission"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Resource</Label>
                    <Input value={form.resource} onChange={(e) => setForm((s) => ({ ...s, resource: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Action</Label>
                    <Input value={form.action} onChange={(e) => setForm((s) => ({ ...s, action: e.target.value }))} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => (setOpen(false), resetForm())}>
                  Cancel
                </Button>
                <Button onClick={() => void onSubmit()} disabled={loading}>
                  {editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />
    </div>
  );
}
