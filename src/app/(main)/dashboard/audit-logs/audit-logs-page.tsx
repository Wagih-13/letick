"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, FileText, PlusSquare, Edit3, Trash2, LogIn, LogOut, Users, Layers, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getAuditColumns, type AuditRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<any | null>(null);

  const [q, setQ] = useState("");
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [user, setUser] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<AuditRow | null>(null);

  const columns = useMemo(
    () =>
      getAuditColumns({
        onView: (row) => {
          setViewing(row);
          setOpen(true);
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
    void fetchAudits();
    void fetchMetrics();
  }, [q, resource, action, user, pageIndex, pageSize]);

  async function fetchAudits() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (resource) params.set("resource", resource);
      if (action) params.set("action", action);
      if (user) params.set("user", user);
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/audit?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load audit logs");
      setItems((data.data?.items || []).map((r: any) => ({ ...r })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (resource) params.set("resource", resource);
      if (action) params.set("action", action);
      if (user) params.set("user", user);
      const res = await fetch(`/api/v1/audit/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
    } catch {}
  }

  function exportFile(kind: "csv" | "json") {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (resource) params.set("resource", resource);
    if (action) params.set("action", action);
    if (user) params.set("user", user);
    window.open(`/api/v1/audit/export/${kind}?${params.toString()}`, "_blank");
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-9">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total logs</div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.totalLogs ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Create</div>
            <PlusSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.createCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Update</div>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.updateCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Delete</div>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.deleteCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Login</div>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.loginCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Logout</div>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.logoutCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">New (30d)</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.last30dCount ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Users</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.distinctUsers ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Resources</div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.distinctResources ?? 0)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search IP or user agent" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resource">Resource</Label>
            <Input id="resource" placeholder="e.g. role, permission" value={resource} onChange={(e) => setResource(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="action">Action</Label>
            <Input id="action" placeholder="create/update/delete" value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user">User email</Label>
            <Input id="user" placeholder="e.g. admin@..." value={user} onChange={(e) => setUser(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchAudits()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button variant="secondary" onClick={() => exportFile("csv")}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => exportFile("json")}>
            Export JSON
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : (setOpen(false), setViewing(null)))}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Audit Details</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Action</div>
                  <div className="font-medium break-words capitalize">{viewing.action}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Resource</div>
                  <div className="font-medium break-words">{viewing.resource}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">User</div>
                  <div className="font-medium break-words">{viewing.userEmail || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">IP</div>
                  <div className="font-medium break-words">{viewing.ipAddress || "-"}</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Changes</div>
                <pre className="max-h-64 overflow-auto overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted p-2 text-xs">
                  {viewing.changes && Object.keys(viewing.changes).length ? JSON.stringify(viewing.changes, null, 2) : "{} (no changes recorded)"}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Metadata</div>
                <pre className="max-h-64 overflow-auto overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted p-2 text-xs">
                  {viewing.metadata && Object.keys(viewing.metadata).length ? JSON.stringify(viewing.metadata, null, 2) : "{} (no metadata recorded)"}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">User Agent</div>
                <pre className="max-h-40 overflow-auto overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted p-2 text-xs">{viewing.userAgent || "-"}</pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
