"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type OrderRow = {
  id: string;
  orderNumber: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
  totalAmount: string;
  currency: string;
  createdAt: string | Date;
};

export function getOrderColumns(actions: { onView: (row: OrderRow) => void; onEdit: (row: OrderRow) => void; onDelete: (row: OrderRow) => void }): ColumnDef<OrderRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">#{row.original.orderNumber}</span>
          <span className="text-muted-foreground text-xs">
            {(() => {
              const fn = row.original.customerFirstName || "";
              const ln = row.original.customerLastName || "";
              const full = `${fn} ${ln}`.trim();
              return full || row.original.customerEmail || "—";
            })()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
      cell: ({ row }) => <Badge variant={row.original.paymentStatus === "paid" ? "default" : row.original.paymentStatus === "failed" ? "destructive" : "outline"}>{row.original.paymentStatus}</Badge>,
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => <span>{row.original.currency} {row.original.totalAmount}</span>,
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
          <Button variant="outline" size="sm" onClick={() => actions.onView(row.original)}>
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => actions.onEdit(row.original)}>
            <Pencil className="mr-1 h-4 w-4" /> Update
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
