"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Trash2, Download, RotateCcw } from "lucide-react";

export type BackupRow = {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: string;
  type: string;
  createdAt: string | Date;
};

export function getBackupColumns(actions: { onDelete: (row: BackupRow) => void; onDownload: (row: BackupRow) => void; onRestore: (row: BackupRow) => void }): ColumnDef<BackupRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Backup" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.fileName}</span>
        </div>
      ),
    },
    {
      accessorKey: "fileSize",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
      cell: ({ row }) => <span className="text-muted-foreground">{(row.original.fileSize / 1024).toFixed(1)} KB</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant={row.original.status === "completed" ? "default" : "secondary"}>{row.original.status}</Badge>,
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
          <Button variant="outline" size="sm" onClick={() => actions.onDownload(row.original)}>
            <Download className="mr-1 h-4 w-4" /> Download
          </Button>
          <Button variant="secondary" size="sm" onClick={() => actions.onRestore(row.original)} disabled={row.original.status !== "completed"}>
            <RotateCcw className="mr-1 h-4 w-4" /> Restore
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
