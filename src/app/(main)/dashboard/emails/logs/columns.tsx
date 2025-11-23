"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RotateCcw } from "lucide-react";

export type EmailLogRow = {
  id: string;
  to: string;
  from: string;
  subject: string;
  status: string;
  createdAt: string | Date;
};

export function getEmailLogColumns(actions: { onResend: (row: EmailLogRow) => void }): ColumnDef<EmailLogRow>[] {
  return [
    {
      accessorKey: "to",
      header: ({ column }) => <DataTableColumnHeader column={column} title="To" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.to}</span>
          <span className="text-muted-foreground text-xs">from {row.original.from}</span>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => <span className="text-muted-foreground line-clamp-1">{row.original.subject}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "sent" ? "default" : row.original.status === "failed" ? "destructive" : "secondary"}>{row.original.status}</Badge>,
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
          <Button variant="outline" size="sm" onClick={() => actions.onResend(row.original)}>
            <RotateCcw className="mr-1 h-4 w-4" /> Resend
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
