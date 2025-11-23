"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type DiscountRow = {
  id: string;
  name: string;
  code?: string | null;
  type: string;
  value: string;
  scope: string;
  status: string;
  isAutomatic: boolean;
  usageLimit?: number | null;
  usageCount: number;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  createdAt: string | Date;
};

export function getDiscountColumns(actions: { onEdit: (row: DiscountRow) => void; onDelete: (row: DiscountRow) => void }): ColumnDef<DiscountRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.code || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <span className="text-sm capitalize">{row.original.type.replaceAll("_", " ")}</span>,
    },
    {
      accessorKey: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      cell: ({ row }) => <span>{row.original.type === "percentage" ? `${row.original.value}%` : `$${row.original.value}`}</span>,
    },
    {
      accessorKey: "scope",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
      cell: ({ row }) => <span className="text-sm capitalize">{row.original.scope.replaceAll("_", " ")}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "outline"}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "usageCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.usageCount}{row.original.usageLimit ? ` / ${row.original.usageLimit}` : ""}</span>
      ),
    },
    {
      accessorKey: "startsAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Starts" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.startsAt ? format(new Date(row.original.startsAt), "yyyy-MM-dd HH:mm") : "—"}</span>
      ),
    },
    {
      accessorKey: "endsAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ends" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.endsAt ? format(new Date(row.original.endsAt), "yyyy-MM-dd HH:mm") : "—"}</span>
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
