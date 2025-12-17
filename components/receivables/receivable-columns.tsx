"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, DollarSign, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { ReceivableWithDetails } from "@/lib/types/receivables";
import { AccountsReceivableStatus } from "@/prisma/prisma-client";

interface CreateReceivableColumnsProps {
  onView: (receivable: ReceivableWithDetails) => void;
  onPayment: (receivable: ReceivableWithDetails) => void;
  onCancel: (receivable: ReceivableWithDetails) => void;
  t: (key: string) => string;
  locale?: string;
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

const getStatusBadge = (
  status: AccountsReceivableStatus,
  t: (key: string) => string,
) => {
  const variants: Record<
    AccountsReceivableStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    [AccountsReceivableStatus.OPEN]: {
      label: t("statusOpen"),
      variant: "destructive",
    },
    [AccountsReceivableStatus.PARTIAL]: {
      label: t("statusPartial"),
      variant: "secondary",
    },
    [AccountsReceivableStatus.PAID]: {
      label: t("statusPaid"),
      variant: "default",
    },
    [AccountsReceivableStatus.CANCELED]: {
      label: t("statusCanceled"),
      variant: "outline",
    },
  };

  const config = variants[status];
  return (
    <Badge variant={config.variant} className="font-normal">
      {config.label}
    </Badge>
  );
};

export const createReceivableColumns = ({
  onView,
  onPayment,
  onCancel,
  t,
  locale = "es",
}: CreateReceivableColumnsProps): ColumnDef<ReceivableWithDetails>[] => [
  {
    accessorKey: "sale.saleNumber",
    header: t("saleNumber"),
    cell: ({ row }) => {
      const sale = row.original.sale;
      if (!sale) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="font-mono font-semibold">
          #{String(sale.saleNumber).padStart(4, "0")}
        </span>
      );
    },
  },
  {
    accessorKey: "customer.name",
    header: t("customer"),
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{customer.name}</span>
          {customer.email && (
            <span className="text-xs text-muted-foreground">
              {customer.email}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">{t("total")}</div>,
    cell: ({ row }) => {
      const total = row.getValue("total") as string;
      return (
        <div className="text-right font-medium">{formatCurrency(total)}</div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">{t("balance")}</div>,
    cell: ({ row }) => {
      const balance = row.getValue("balance") as string;
      return (
        <div className="text-right font-semibold text-amber-600 dark:text-amber-400">
          {formatCurrency(balance)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: t("status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as AccountsReceivableStatus;
      return getStatusBadge(status, t);
    },
  },
  {
    accessorKey: "createdAt",
    header: t("createdAt"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const dateLocale = locale === "es" ? es : enUS;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(date, { addSuffix: true, locale: dateLocale })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }) => {
      const receivable = row.original;
      const canPay =
        receivable.status !== AccountsReceivableStatus.PAID &&
        receivable.status !== AccountsReceivableStatus.CANCELED;
      const canCancel =
        receivable.status !== AccountsReceivableStatus.PAID &&
        receivable.status !== AccountsReceivableStatus.CANCELED &&
        (receivable.payments?.length || 0) === 0;

      return (
        <div className="flex justify-end">
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
              <DropdownMenuItem onClick={() => onView(receivable)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("view")}
              </DropdownMenuItem>
              {canPay && (
                <DropdownMenuItem onClick={() => onPayment(receivable)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t("registerPayment")}
                </DropdownMenuItem>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancel(receivable)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {t("cancel")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
