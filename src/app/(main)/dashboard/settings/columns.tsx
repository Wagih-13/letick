"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2 } from "lucide-react";

export type SettingRow = {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function getSettingColumns(actions: { onEdit: (row: SettingRow) => void; onDelete: (row: SettingRow) => void }): ColumnDef<SettingRow>[] {
  return [
    {
      accessorKey: "key",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.key}</span>
          {row.original.description ? (
            <span className="text-muted-foreground text-xs">{row.original.description}</span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      cell: ({ row }) => <span className="max-w-[320px] truncate text-muted-foreground">{row.original.value}</span>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
    },
    {
      accessorKey: "isPublic",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Visibility" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isPublic ? "default" : "secondary"}>{row.original.isPublic ? "Public" : "Private"}</Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.original.updatedAt), "yyyy-MM-dd")}</span>,
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
