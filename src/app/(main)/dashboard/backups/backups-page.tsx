"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getBackupColumns, type BackupRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function BackupsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BackupRow[]>([]);
  const [total, setTotal] = useState(0);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const columns = useMemo(
    () =>
      getBackupColumns({
        onDownload: (row) => {
          window.open(`/api/v1/backups/${row.id}/download`, "_blank");
        },
        onRestore: async (row) => {
          const yes = confirm(
            `Restore backup "${row.name}"?\n\nThis will overwrite current database data with the backup snapshot.\nIt is recommended to do this on a staging environment first.\n\nContinue?`,
          );
          if (!yes) return;
          try {
            setLoading(true);
            const res = await fetch(`/api/v1/backups/${row.id}/restore`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Restore failed");
            toast.success("Restore completed");
            void fetchBackups();
          } catch (e: any) {
            toast.error(e.message || "Restore failed");
          } finally {
            setLoading(false);
          }
        },
        onDelete: async (row) => {
          const yes = confirm(`Delete backup ${row.name}?`);
          if (!yes) return;
          try {
            const res = await fetch(`/api/v1/backups/${row.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
            toast.success("Backup deleted");
            void fetchBackups();
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
    void fetchBackups();
  }, [pageIndex, pageSize]);

  async function fetchBackups() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/backups?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load backups");
      setItems((data.data?.items || []).map((r: any) => ({ ...r })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load backups");
    } finally {
      setLoading(false);
    }
  }

  async function createBackup() {
    try {
      const res = await fetch(`/api/v1/backups`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to create backup");
      toast.success("Backup created");
      void fetchBackups();
    } catch (e: any) {
      toast.error(e.message || "Create failed");
    }
  }

  async function runRetention() {
    const yes = confirm("Run retention cleanup? Keep last 5 backups.");
    if (!yes) return;
    try {
      const res = await fetch(`/api/v1/backups/retention`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keepLast: 5 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Retention failed");
      toast.success(`Retention removed ${data.data?.deleted ?? 0} old backup(s)`);
      void fetchBackups();
    } catch (e: any) {
      toast.error(e.message || "Retention failed");
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchBackups()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => void createBackup()} disabled={loading}>
            <Plus className="mr-1 h-4 w-4" /> Create Backup
          </Button>
          <Button variant="secondary" onClick={() => void runRetention()} disabled={loading}>
            Retention Cleanup
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
