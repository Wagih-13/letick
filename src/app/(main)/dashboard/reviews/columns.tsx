"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export type ReviewRow = {
  id: string;
  productId: string;
  productName: string;
  userId?: string | null;
  userName?: string | null;
  orderId?: string | null;
  rating: number;
  title?: string | null;
  content: string;
  isApproved: boolean;
  helpfulCount: number;
  reportCount: number;
  createdAt: string | Date;
};

export function getReviewColumns(actions: {
  onApprove: (row: ReviewRow) => void;
  onReject: (row: ReviewRow) => void;
  onDelete: (row: ReviewRow) => void;
}): ColumnDef<ReviewRow>[] {
  return [
    {
      accessorKey: "productName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.productName}</span>
          <span className="text-muted-foreground text-xs">Rating: {row.original.rating}★</span>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.userName || "—"}</span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => <span className="text-sm">{row.original.title || "—"}</span>,
    },
    {
      accessorKey: "isApproved",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isApproved ? "default" : "secondary"}>{row.original.isApproved ? "Approved" : "Pending"}</Badge>
      ),
    },
    {
      accessorKey: "helpfulCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Helpful" />,
      cell: ({ row }) => <span className="text-sm">{row.original.helpfulCount}</span>,
    },
    {
      accessorKey: "reportCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reports" />,
      cell: ({ row }) => <span className="text-sm">{row.original.reportCount}</span>,
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
          {row.original.isApproved ? (
            <Button variant="outline" size="sm" onClick={() => actions.onReject(row.original)}>
              Reject
            </Button>
          ) : (
            <Button size="sm" onClick={() => actions.onApprove(row.original)}>
              Approve
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => actions.onDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
