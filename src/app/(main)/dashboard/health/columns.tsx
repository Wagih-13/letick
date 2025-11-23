"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export type HealthRow = {
  id: string;
  service: string;
  status: string;
  responseTime?: number | null;
  checkedAt?: string | Date | null;
  createdAt: string | Date;
};

export function getHealthColumns(): ColumnDef<HealthRow>[] {
  return [
    {
      accessorKey: "service",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
      cell: ({ row }) => <span className="font-medium">{row.original.service}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "healthy" ? "default" : "destructive"}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "responseTime",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Response (ms)" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.responseTime ?? "-"}</span>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Checked" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm")}
        </span>
      ),
    },
  ];
}
