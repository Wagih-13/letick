"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type ShipmentRow = {
  id: string;
  orderId: string;
  orderNumber?: string | null;
  shippingMethodId?: string | null;
  methodName?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  status: string;
  shippedAt?: string | Date | null;
  estimatedDeliveryAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  createdAt: string | Date;
};

export function getShipmentColumns(actions: { onEdit: (row: ShipmentRow) => void; onDelete: (row: ShipmentRow) => void }): ColumnDef<ShipmentRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">#{row.original.orderNumber || "—"}</span>
          <span className="text-muted-foreground text-xs">{row.original.methodName || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "trackingNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tracking" />,
      cell: ({ row }) => <span className="text-sm">{row.original.trackingNumber || "—"}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      accessorKey: "shippedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Shipped" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.shippedAt ? format(new Date(row.original.shippedAt), "yyyy-MM-dd HH:mm") : "—"}
        </span>
      ),
    },
    {
      accessorKey: "estimatedDeliveryAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ETA" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.estimatedDeliveryAt ? format(new Date(row.original.estimatedDeliveryAt), "yyyy-MM-dd") : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
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
