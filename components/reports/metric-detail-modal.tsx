"use client";

import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { SaleDetail, ExpenseDetail } from "@/lib/types/reports";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface MetricDetailModalProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  emptyMessage?: string;
  locale?: string;
}

export function MetricDetailModal<TData>({
  open,
  onOpenChange,
  title,
  data,
  columns,
  emptyMessage = "No hay datos disponibles",
  locale = "es",
}: MetricDetailModalProps<TData>) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="lg"
      mobileHeight="85vh"
    >
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            showPagination
            pageSize={10}
          />
        )}
      </div>
    </ResponsiveDialog>
  );
}

// Utility function to create sales detail columns
export function createSalesDetailColumns(
  locale: string = "es",
): ColumnDef<SaleDetail>[] {
  const dateLocale = locale === "es" ? es : enUS;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return [
    {
      accessorKey: "saleNumber",
      header: "# Venta",
      cell: ({ row }) => `#${String(row.original.saleNumber).padStart(4, "0")}`,
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "PP", { locale: dateLocale }),
    },
    {
      accessorKey: "customerName",
      header: "Cliente",
      cell: ({ row }) => row.original.customerName || "-",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: "itemCount",
      header: "Items",
    },
    {
      accessorKey: "createdByName",
      header: "Vendedor",
    },
  ];
}

// Utility function to create expenses detail columns
export function createExpensesDetailColumns(
  locale: string = "es",
): ColumnDef<ExpenseDetail>[] {
  const dateLocale = locale === "es" ? es : enUS;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return [
    {
      accessorKey: "incurredAt",
      header: "Fecha",
      cell: ({ row }) =>
        format(new Date(row.original.incurredAt), "PP", { locale: dateLocale }),
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "categoryName",
      header: "Categoría",
      cell: ({ row }) => row.original.categoryName || "-",
    },
    {
      accessorKey: "createdByName",
      header: "Creado por",
    },
  ];
}
