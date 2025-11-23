"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type PermissionRow = {
  id: string;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string | null;
  createdAt: string | Date;
};

export function getPermissionColumns(actions: {
  onEdit: (row: PermissionRow) => void;
  onDelete: (row: PermissionRow) => void;
}): ColumnDef<PermissionRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Permission" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium capitalize">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "resource",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.resource}.{row.original.action}
        </Badge>
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
