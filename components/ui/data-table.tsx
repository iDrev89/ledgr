"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Total count for pagination display (required for server-side pagination) */
  totalCount?: number;
  /** Show column visibility dropdown */
  showColumnVisibility?: boolean;
  /** Show pagination controls */
  showPagination?: boolean;
  /** Initial page size */
  pageSize?: number;
  /** Custom empty message */
  emptyMessage?: string;
  /** Current page for server-side pagination (0-indexed) */
  page?: number;
  /** Callback when page changes for server-side pagination */
  onPageChange?: (page: number) => void;
  /** Enable internal pagination rendering. Set to false if pagination is handled externally. */
  enablePagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  showColumnVisibility = false,
  showPagination = true,
  pageSize = 10,
  emptyMessage = "No hay resultados.",
  page,
  onPageChange,
  enablePagination = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Determine if we're using server-side pagination
  const isServerSidePagination =
    page !== undefined && onPageChange !== undefined;

  // Calculate display values for pagination
  const currentPage = isServerSidePagination
    ? page
    : table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const displayedRows = table.getRowModel().rows.length;
  const startItem = currentPage * currentPageSize + 1;
  const endItem = Math.min(
    startItem + displayedRows - 1,
    totalCount ?? data.length,
  );
  const total = totalCount ?? data.length;
  const totalPages = Math.ceil(total / currentPageSize);

  return (
    <div className="w-full">
      {/* Column visibility dropdown (if enabled) */}
      {showColumnVisibility && (
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table - Clean design without outer border */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/50 hover:bg-muted/50 border-b"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Clean design */}
      {showPagination && enablePagination && total > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {displayedRows > 0 ? startItem : 0} -{" "}
            {displayedRows > 0 ? endItem : 0} de {total} registros
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSidePagination) {
                  onPageChange(Math.max(0, currentPage - 1));
                } else {
                  table.previousPage();
                }
              }}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSidePagination) {
                  onPageChange(currentPage + 1);
                } else {
                  table.nextPage();
                }
              }}
              disabled={currentPage >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
