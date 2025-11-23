"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

type VariantRow = {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  price: string;
  compareAtPrice?: string | null;
  stockQuantity: number;
  lowStockThreshold?: number;
  options?: Record<string, string> | null;
  image?: string | null;
  isActive: boolean;
  sortOrder?: number;
};

export function ProductVariantsManager({ productId, open, onOpenChange }: { productId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<VariantRow[]>([]);
  const [editing, setEditing] = useState<VariantRow | null>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    price: "0.00",
    compareAtPrice: "",
    stockQuantity: 0,
    size: "",
    color: "",
    image: "",
    isActive: true as boolean,
    sortOrder: 0,
  });

  const columns = useMemo<ColumnDef<VariantRow>[]>(
    () => [
      { accessorKey: "sku", header: "SKU", cell: ({ row }) => <span className="font-medium">{row.original.sku}</span> },
      { accessorKey: "name", header: "Name", cell: ({ row }) => <span>{row.original.name || ""}</span> },
      { accessorKey: "price", header: "Price", cell: ({ row }) => <span>${row.original.price}</span> },
      { accessorKey: "stockQuantity", header: "Stock", cell: ({ row }) => <span>{row.original.stockQuantity}</span> },
      { accessorKey: "options", header: "Options", cell: ({ row }) => {
        const opts = row.original.options || {};
        const size = (opts as any).size;
        const color = (opts as any).color;
        return <span className="text-sm text-muted-foreground">{[color && `color: ${color}`, size && `size: ${size}`].filter(Boolean).join(", ") || "—"}</span>;
      } },
      { accessorKey: "isActive", header: "Active", cell: ({ row }) => <span>{row.original.isActive ? "Yes" : "No"}</span> },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => void onDelete(row.original.id)}>Delete</Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useDataTableInstance({ data: items, columns, defaultPageIndex: 0, defaultPageSize: 10, pageCount: 1, manualPagination: false, getRowId: (r) => r.id });

  function resetForm() {
    setEditing(null);
    setForm({ sku: "", name: "", price: "0.00", compareAtPrice: "", stockQuantity: 0, size: "", color: "", image: "", isActive: true, sortOrder: 0 });
  }

  function buildOptions() {
    const opts: Record<string, string> = {};
    if (form.color.trim()) opts.color = form.color.trim();
    if (form.size.trim()) opts.size = form.size.trim();
    return Object.keys(opts).length ? opts : undefined;
  }

  async function fetchVariants() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/products/${productId}/variants`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load variants");
      setItems((data.data?.items || []) as VariantRow[]);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load variants");
    } finally {
      setLoading(false);
    }
  }

  function onEdit(v: VariantRow) {
    setEditing(v);
    const size = v.options?.size || "";
    const color = v.options?.color || "";
    setForm({
      sku: v.sku || "",
      name: v.name || "",
      price: String(v.price || "0.00"),
      compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : "",
      stockQuantity: Number(v.stockQuantity || 0),
      size,
      color,
      image: v.image || "",
      isActive: Boolean(v.isActive),
      sortOrder: Number(v.sortOrder || 0),
    });
  }

  async function onSubmit() {
    try {
      const payload: any = {
        sku: form.sku.trim(),
        name: form.name.trim() || null,
        price: form.price,
        compareAtPrice: form.compareAtPrice.trim() ? form.compareAtPrice : null,
        stockQuantity: Number.isFinite(form.stockQuantity) ? Number(form.stockQuantity) : 0,
        lowStockThreshold: undefined,
        options: buildOptions(),
        image: form.image.trim() ? form.image.trim() : null,
        isActive: Boolean(form.isActive),
        sortOrder: Number.isFinite(form.sortOrder) ? Number(form.sortOrder) : 0,
      };
      const editingId = editing?.id;
      const res = await fetch(editingId ? `/api/v1/products/${productId}/variants/${editingId}` : `/api/v1/products/${productId}/variants`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Save failed");
      toast.success(editingId ? "Variant updated" : "Variant created");
      resetForm();
      void fetchVariants();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  }

  async function onDelete(variantId: string) {
    try {
      const yes = confirm("Delete variant?");
      if (!yes) return;
      const res = await fetch(`/api/v1/products/${productId}/variants/${variantId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Delete failed");
      toast.success("Variant deleted");
      void fetchVariants();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  }

  useEffect(() => {
    if (open && productId) void fetchVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Variants</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar pr-6 -mr-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Name (optional)</Label>
              <Input placeholder="auto from options if empty" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Price</Label>
              <Input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Compare at price</Label>
              <Input placeholder="Optional" value={form.compareAtPrice} onChange={(e) => setForm((s) => ({ ...s, compareAtPrice: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Stock quantity</Label>
              <Input type="number" min={0} value={form.stockQuantity} onChange={(e) => setForm((s) => ({ ...s, stockQuantity: Number(e.target.value || 0) }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Sort order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((s) => ({ ...s, sortOrder: Number(e.target.value || 0) }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <Input placeholder="e.g. Red" value={form.color} onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Size</Label>
              <Input placeholder="e.g. M" value={form.size} onChange={(e) => setForm((s) => ({ ...s, size: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Image URL</Label>
              <Input placeholder="Optional" value={form.image} onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="isActive" checked={form.isActive} onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: Boolean(v) }))} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="mt-4">
            <DataTable table={table as any} columns={columns as any} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => (resetForm(), onOpenChange(false))}>Close</Button>
          <Button onClick={() => void onSubmit()} disabled={loading}>{editing ? "Update Variant" : "Add Variant"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
