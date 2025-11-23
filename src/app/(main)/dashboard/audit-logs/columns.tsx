"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";

export type AuditRow = {
  id: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  changes?: Record<string, unknown> | null;
  userEmail?: string | null;
  createdAt: string | Date;
};

export function getAuditColumns(actions?: { onView?: (row: AuditRow) => void }): ColumnDef<AuditRow>[] {
  return [
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.action}</Badge>,
    },
    {
      accessorKey: "resource",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.resource}</span>
          {row.original.resourceId ? (
            <span className="text-muted-foreground text-xs">{row.original.resourceId}</span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "userEmail",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.userEmail || "-"}</span>,
    },
    {
      accessorKey: "ipAddress",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.ipAddress || "-"}</span>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm")}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => actions?.onView?.(row.original)}>
            Details
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
