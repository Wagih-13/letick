"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  price: string;
  compareAtPrice?: string | null;
  onSale?: boolean;
  status: string;
  stockStatus: string;
  isFeatured: boolean;
  averageRating?: string;
  reviewCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  primaryImageUrl?: string | null;
  categoryNames?: string[];
  quantity?: number;
};

export function getProductColumns(actions: { onEdit: (row: ProductRow) => void; onDelete: (row: ProductRow) => void }): ColumnDef<ProductRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">SKU: {row.original.sku || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "categoryNames",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => {
        const cats = row.original.categoryNames || [];
        return <span className="text-sm">{cats.length ? cats.join(", ") : "—"}</span>;
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => <span>${row.original.price}</span>,
    },
    {
      accessorKey: "onSale",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sale" />,
      cell: ({ row }) => <Badge variant={row.original.onSale ? "default" : "secondary"}>{row.original.onSale ? "Yes" : "No"}</Badge>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : row.original.status === "draft" ? "secondary" : "outline"}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "stockStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{row.original.stockStatus}</Badge>
          {(() => {
            const q: any = (row.original as any).quantity;
            const qty = q == null ? null : Number(q);
            return <span className="text-xs text-muted-foreground">Qty: {qty == null || Number.isNaN(qty) ? "—" : qty}</span>;
          })()}
        </div>
      ),
    },
    {
      accessorKey: "isFeatured",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Featured" />,
      cell: ({ row }) => <span className="text-sm">{row.original.isFeatured ? "Yes" : "No"}</span>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm")}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => actions.onEdit(row.original)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => actions.onDelete(row.original)}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
