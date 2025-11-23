"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { CheckCircle2, Archive, Trash2 } from "lucide-react";

export type NotificationRow = {
  id: string;
  userId: string;
  type: string;
  status: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  createdAt: string | Date;
};

export function getNotificationColumns(actions: { onMarkRead: (row: NotificationRow) => void; onArchive: (row: NotificationRow) => void; onDelete: (row: NotificationRow) => void }): ColumnDef<NotificationRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-muted-foreground text-xs line-clamp-1">{row.original.message}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "unread" ? "default" : row.original.status === "archived" ? "secondary" : "outline"}>{row.original.status}</Badge>
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
          <Button variant="outline" size="sm" onClick={() => actions.onMarkRead(row.original)} disabled={row.original.status !== "unread"}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Read
          </Button>
          <Button variant="secondary" size="sm" onClick={() => actions.onArchive(row.original)} disabled={row.original.status === "archived"}>
            <Archive className="mr-1 h-4 w-4" /> Archive
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

export type BroadcastRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  target: string; // roles or All users
  count: number; // recipients count
  createdAt: string | Date;
};

export function getBroadcastColumns(): ColumnDef<BroadcastRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />, 
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-muted-foreground text-xs line-clamp-1">{row.original.message}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />, 
      cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
    },
    {
      accessorKey: "target",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Target" />, 
      cell: ({ row }) => <span className="text-sm">{row.original.target}</span>,
    },
    {
      accessorKey: "count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />, 
      cell: ({ row }) => <span className="text-sm">{row.original.count}</span>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />, 
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm")}</span>,
    },
  ];
}
