"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2, CheckCircle2, PackageCheck } from "lucide-react";

export type ReturnRow = {
  id: string;
  orderId: string;
  orderNumber?: string | null;
  rmaNumber: string;
  status: "requested" | "approved" | "rejected" | "received" | "refunded" | "cancelled" | string;
  requestedAt: string | Date;
  approvedAt?: string | Date | null;
  receivedAt?: string | Date | null;
  createdAt: string | Date;
};

export function getReturnColumns(actions: {
  onApprove: (row: ReturnRow) => void;
  onReceive: (row: ReturnRow) => void;
  onEdit: (row: ReturnRow) => void;
  onDelete: (row: ReturnRow) => void;
}): ColumnDef<ReturnRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.orderNumber || row.original.orderId}</span>
          <span className="text-muted-foreground text-xs">RMA: {row.original.rmaNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "approved" || row.original.status === "received" ? "default" : "outline"}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "requestedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.original.requestedAt), "yyyy-MM-dd HH:mm")}</span>,
    },
    {
      accessorKey: "approvedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Approved" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.approvedAt ? format(new Date(row.original.approvedAt), "yyyy-MM-dd HH:mm") : "—"}</span>
      ),
    },
    {
      accessorKey: "receivedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.receivedAt ? format(new Date(row.original.receivedAt), "yyyy-MM-dd HH:mm") : "—"}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => actions.onApprove(row.original)} disabled={row.original.status !== "requested"}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
          </Button>
          <Button variant="outline" size="sm" onClick={() => actions.onReceive(row.original)} disabled={row.original.status !== "approved"}>
            <PackageCheck className="mr-1 h-4 w-4" /> Mark Received
          </Button>
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
