"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2, CheckCircle2, PlayCircle } from "lucide-react";

export type RefundRow = {
  id: string;
  orderId: string;
  orderNumber?: string | null;
  amount: string;
  currency: string;
  status: "pending" | "approved" | "rejected" | "processed" | string;
  reason?: string | null;
  processedAt?: string | Date | null;
  createdAt: string | Date;
};

export function getRefundColumns(actions: {
  onApprove: (row: RefundRow) => void;
  onProcess: (row: RefundRow) => void;
  onEdit: (row: RefundRow) => void;
  onDelete: (row: RefundRow) => void;
}): ColumnDef<RefundRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => <span className="font-medium">{row.original.orderNumber || row.original.orderId}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <span>{row.original.currency} {row.original.amount}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "approved" || row.original.status === "processed" ? "default" : "outline"}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "processedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Processed" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.processedAt ? format(new Date(row.original.processedAt), "yyyy-MM-dd HH:mm") : "—"}</span>
      ),
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
          <Button variant="outline" size="sm" onClick={() => actions.onApprove(row.original)} disabled={row.original.status !== "pending"}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
          </Button>
          <Button variant="outline" size="sm" onClick={() => actions.onProcess(row.original)} disabled={row.original.status !== "approved"}>
            <PlayCircle className="mr-1 h-4 w-4" /> Process
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
