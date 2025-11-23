"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Eye, Trash2 } from "lucide-react";

export type CustomerRow = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  ordersCount?: number;
  totalSpent?: number;
  avgOrderValue?: number;
  lastOrderAt?: string | Date | null;
};

export function getCustomerColumns(actions: {
  onView: (row: CustomerRow) => void;
  onDelete: (row: CustomerRow) => void;
}, opts?: { currency?: string }): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.firstName || row.original.lastName
              ? `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim()
              : row.original.email}
          </span>
          <span className="text-muted-foreground text-xs">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"} className={row.original.isActive ? "bg-green-600" : ""}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "ordersCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
      cell: ({ row }) => <span className="text-sm">{row.original.ordersCount ?? 0}</span>,
    },
    {
      accessorKey: "totalSpent",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Spent" />,
      cell: ({ row }) => {
        const v = Number(row.original.totalSpent ?? 0);
        const c = opts?.currency || "USD";
        return <span className="text-sm">{new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(v)}</span>;
      },
    },
    {
      accessorKey: "avgOrderValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="AOV" />,
      cell: ({ row }) => {
        const v = Number(row.original.avgOrderValue ?? 0);
        const c = opts?.currency || "USD";
        return <span className="text-sm">{new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(v)}</span>;
      },
    },
    {
      accessorKey: "lastOrderAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last order" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.lastOrderAt ? format(new Date(row.original.lastOrderAt), "yyyy-MM-dd") : "—"}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.original.createdAt), "yyyy-MM-dd")}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              actions.onView(row.original);
            }}
          >
            <Eye className="mr-1 h-4 w-4" /> View
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              actions.onDelete(row.original);
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
