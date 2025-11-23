"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Pencil, Trash2, KeyRound } from "lucide-react";

export type UserRow = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  roles: Array<{ id: string; name: string; slug: string }>;
};

export function getUserColumns(actions: {
  onEdit: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
  onReset: (row: UserRow) => void;
}): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.firstName || row.original.lastName ? `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() : row.original.email}</span>
          <span className="text-muted-foreground text-xs">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: () => <div>Roles</div>,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.roles || []).map((r) => (
            <Badge key={r.slug} variant="secondary" className="capitalize">
              {r.slug}
            </Badge>
          ))}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
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
          <Button variant="outline" size="sm" onClick={() => actions.onReset(row.original)}>
            <KeyRound className="mr-1 h-4 w-4" /> Reset
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
