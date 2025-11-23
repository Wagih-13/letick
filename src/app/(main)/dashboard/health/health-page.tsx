"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getHealthColumns, type HealthRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function HealthPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<HealthRow[]>([]);
  const [total, setTotal] = useState(0);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);
  const [service, setService] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const columns = useMemo(() => getHealthColumns(), []);

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
    void fetchHealth();
  }, [pageIndex, pageSize, service]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      void fetchHealth();
    }, 10000);
    return () => clearInterval(t);
  }, [autoRefresh, pageIndex, pageSize, service]);

  async function fetchHealth() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      if (service !== "all") params.set("service", service);
      const res = await fetch(`/api/v1/health?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load health checks");
      setItems((data.data?.items || []).map((r: any) => ({ ...r })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load health checks");
    } finally {
      setLoading(false);
    }
  }

  async function runCheck() {
    try {
      const res = await fetch(`/api/v1/health`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to run health check");
      toast.success("Health check recorded");
      void fetchHealth();
    } catch (e: any) {
      toast.error(e.message || "Run check failed");
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Service</Label>
            <Select value={service} onValueChange={(v) => setService(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="app">app</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="autorefresh" type="checkbox" className="h-4 w-4" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            <Label htmlFor="autorefresh">Auto refresh (10s)</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchHealth()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => void runCheck()} disabled={loading}>
            <Activity className="mr-1 h-4 w-4" /> Run Check
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />
    </div>
  );
}
