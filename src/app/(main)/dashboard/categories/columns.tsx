"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function getCategoryColumns(actions: { onEdit: (row: CategoryRow) => void; onDelete: (row: CategoryRow) => void }): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">/{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "outline"}>{row.original.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sort" />,
      cell: ({ row }) => <span className="text-sm">{row.original.sortOrder}</span>,
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
