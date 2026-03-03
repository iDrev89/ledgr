"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Ban, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PayrollRunWithDetails } from "@/lib/types/payroll";
import { PayrollRunStatus } from "@/prisma/prisma-client";

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

const getStatusBadge = (status: PayrollRunStatus, t: (key: string) => string) => {
  const variants = {
    [PayrollRunStatus.DRAFT]: "secondary",
    [PayrollRunStatus.FINALIZED]: "default",
    [PayrollRunStatus.PAID]: "success",
  } as const;

  const labels = {
    [PayrollRunStatus.DRAFT]: t("statusDraft"),
    [PayrollRunStatus.FINALIZED]: t("statusFinalized"),
    [PayrollRunStatus.PAID]: t("statusPaid"),
  };

  return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
};

export const getPayrollRunColumns = (
  t: (key: string) => string,
  onView: (run: PayrollRunWithDetails) => void,
  onFinalize: (run: PayrollRunWithDetails) => void,
  onPay: (run: PayrollRunWithDetails) => void,
  onDelete: (run: PayrollRunWithDetails) => void,
): ColumnDef<PayrollRunWithDetails>[] => [
  {
    accessorKey: "periodLabel",
    header: t("periodLabel"),
    cell: ({ row }) => {
      const run = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{run.periodLabel}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(run.startDate), "dd MMM", { locale: es })} -{" "}
            {format(new Date(run.endDate), "dd MMM yyyy", { locale: es })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "periodType",
    header: t("periodType"),
    cell: ({ row }) => {
      const types: Record<string, string> = {
        DAILY: t("periodTypeDaily"),
        BIWEEKLY: t("periodTypeBiweekly"),
        CUSTOM: t("periodTypeCustom"),
      };
      return types[row.original.periodType] ?? row.original.periodType;
    },
  },
  {
    accessorKey: "status",
    header: t("status"),
    cell: ({ row }) => getStatusBadge(row.original.status, t),
  },
  {
    accessorKey: "items",
    header: t("employees"),
    cell: ({ row }) => {
      const count = row.original.items?.length || 0;
      return `${count} ${t("employees").toLowerCase()}`;
    },
  },
  {
    accessorKey: "totalPayable",
    header: t("payableTotal"),
    cell: ({ row }) => {
      const total =
        row.original.items?.reduce(
          (sum, item) => sum + parseFloat(item.payableTotal),
          0,
        ) || 0;
      return (
        <span className="font-mono tabular-nums">{formatCurrency(total)}</span>
      );
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => {
      const run = row.original;
      const canFinalize = run.status === PayrollRunStatus.DRAFT;
      const canPay = run.status === PayrollRunStatus.FINALIZED;
      const canDelete = run.status === PayrollRunStatus.DRAFT;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t("openMenu")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(run)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>
            {canFinalize && (
              <DropdownMenuItem onClick={() => onFinalize(run)}>
                <Ban className="mr-2 h-4 w-4" />
                {t("finalize")}
              </DropdownMenuItem>
            )}
            {canPay && (
              <DropdownMenuItem onClick={() => onPay(run)}>
                <Ban className="mr-2 h-4 w-4" />
                {t("pay")}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(run)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t("delete")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
