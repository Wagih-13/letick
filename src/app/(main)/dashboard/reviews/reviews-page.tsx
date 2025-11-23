"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Star, CheckCircle2, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getReviewColumns, type ReviewRow } from "./columns";

const DEFAULT_LIMIT = 10;

export default function ReviewsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<any | null>(null);

  const [q, setQ] = useState("");
  const [approval, setApproval] = useState<string>("all"); // all | approved | pending
  const [rating, setRating] = useState<string>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  const columns = useMemo(
    () =>
      getReviewColumns({
        onApprove: async (row) => {
          try {
            const res = await fetch(`/api/v1/reviews/${row.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isApproved: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Approve failed");
            toast.success("Review approved");
            void fetchReviews();
          } catch (e: any) {
            toast.error(e.message || "Approve failed");
          }
        },
        onReject: async (row) => {
          try {
            const res = await fetch(`/api/v1/reviews/${row.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isApproved: false }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Reject failed");
            toast.success("Review rejected");
            void fetchReviews();
          } catch (e: any) {
            toast.error(e.message || "Reject failed");
          }
        },
        onDelete: async (row) => {
          const yes = confirm(`Delete review for ${row.productName}?`);
          if (!yes) return;
          try {
            const res = await fetch(`/api/v1/reviews/${row.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
            toast.success("Review deleted");
            void fetchReviews();
          } catch (e: any) {
            toast.error(e.message || "Delete failed");
          }
        },
      }),
    [],
  );

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (approval !== "all") params.set("isApproved", String(approval === "approved"));
      if (rating !== "all") params.set("rating", rating);
      const res = await fetch(`/api/v1/reviews/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
    } catch {}
  }

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
    void fetchReviews();
    void fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, approval, rating, pageIndex, pageSize]);

  async function fetchReviews() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (approval !== "all") params.set("isApproved", String(approval === "approved"));
      if (rating !== "all") params.set("rating", rating);
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/reviews?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load reviews");
      const rows = (data.data?.items || []).map((r: any) => {
        const name = [r.userFirstName, r.userLastName].filter(Boolean).join(" ");
        const emailName = (r.userEmail || "").split("@")[0];
        return { ...r, userName: name || emailName || null } as ReviewRow;
      });
      setItems(rows);
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total reviews</div>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.totalReviews ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Approved</div>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.approvedReviews ?? "—"}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Pending</div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.pendingReviews ?? "—"}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Avg rating</div>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.avgRating ?? 0).toFixed(1)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Reviews (30d)</div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.reviews30d ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Verified purchase</div>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.verifiedReviews ?? 0)}</div>
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search title, content or product" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={approval} onValueChange={(v) => setApproval(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Rating</Label>
            <Select value={rating} onValueChange={(v) => setRating(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="1">1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchReviews()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />
    </div>
  );
}
