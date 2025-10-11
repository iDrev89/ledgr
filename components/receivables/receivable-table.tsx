"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createReceivableColumns } from "./receivable-columns";
import type { ReceivableWithDetails } from "@/lib/types/receivables";

interface ReceivableTableProps {
  receivables: ReceivableWithDetails[];
  onView: (receivable: ReceivableWithDetails) => void;
  onPayment: (receivable: ReceivableWithDetails) => void;
  onCancel: (receivable: ReceivableWithDetails) => void;
  t: (key: string) => string;
  locale?: string;
}

export function ReceivableTable({
  receivables,
  onView,
  onPayment,
  onCancel,
  t,
  locale,
}: ReceivableTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = createReceivableColumns({ onView, onPayment, onCancel, t, locale });

  const table = useReactTable({
    data: receivables,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("noResults")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

