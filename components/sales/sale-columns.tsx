"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Trash2, Edit, Check } from "lucide-react";
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
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { SaleWithDetails } from "@/lib/types/sales";
import { PaymentMethod } from "@/prisma/prisma-client";

interface CreateSaleColumnsProps {
  onView: (sale: SaleWithDetails) => void;
  onDelete?: (sale: SaleWithDetails) => void;
  onEdit?: (sale: SaleWithDetails) => void;
  onCloseSale?: (sale: SaleWithDetails) => void;
  isDraftTable?: boolean;
  isAdmin?: boolean;
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

const getPaymentMethodBadge = (
  method: PaymentMethod,
  t: (key: string) => string,
) => {
  const variants: Record<
    PaymentMethod,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    [PaymentMethod.CASH]: {
      label: t("paymentCash"),
      variant: "default",
    },
    [PaymentMethod.CARD]: {
      label: t("paymentCard"),
      variant: "secondary",
    },
    [PaymentMethod.TRANSFER]: {
      label: t("paymentTransfer"),
      variant: "outline",
    },
    [PaymentMethod.DIGITAL]: {
      label: t("paymentDigital"),
      variant: "secondary",
    },
    [PaymentMethod.OTHER]: {
      label: t("paymentOther"),
      variant: "outline",
    },
  };

  const config = variants[method];
  return (
    <Badge variant={config.variant} className="font-normal">
      {config.label}
    </Badge>
  );
};

export const createSaleColumns = ({
  onView,
  onDelete,
  onEdit,
  onCloseSale,
  isDraftTable = false,
  isAdmin = false,
  t,
  locale = "es",
}: CreateSaleColumnsProps): ColumnDef<SaleWithDetails>[] => [
  {
    accessorKey: "saleNumber",
    header: t("saleNumber"),
    cell: ({ row }) => {
      const saleNumber = row.getValue("saleNumber") as number;
      return (
        <span className="font-mono font-semibold">
          #{String(saleNumber).padStart(4, "0")}
        </span>
      );
    },
  },
  {
    accessorKey: "customer.name",
    header: t("customer"),
    cell: ({ row }) => {
      const customerName = row.original.customer.name;
      const customerEmail = row.original.customer.email;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{customerName}</span>
          {customerEmail && (
            <span className="text-xs text-muted-foreground">
              {customerEmail}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: t("items"),
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {items.length} {t("itemsCount")}
          </span>
          <span className="text-xs text-muted-foreground">
            {items
              .slice(0, 2)
              .map((item) => item.product.name)
              .join(", ")}
            {items.length > 2 && `, +${items.length - 2}`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "payments",
    header: t("payments"),
    cell: ({ row }) => {
      const sale = row.original;
      const payments = sale.payments || [];
      const hasReceivable =
        sale.receivable && parseFloat(sale.receivable.balance) > 0;

      if (payments.length === 0) {
        return (
          <Badge variant="outline" className="font-normal">
            {t("noPayments")}
          </Badge>
        );
      }

      if (payments.length === 1 && !hasReceivable) {
        return getPaymentMethodBadge(payments[0].method, t);
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={hasReceivable ? "secondary" : "default"}
            className="font-normal w-fit"
          >
            {payments.length} {t("payments")}
          </Badge>
          {hasReceivable && sale.receivable && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {t("balance")}: {formatCurrency(sale.receivable.balance)}
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
    accessorKey: "createdAt",
    header: t("createdAt"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const dateLocale = locale === "es" ? es : enUS;
      return (
        <div className="text-sm text-muted-foreground">
          <div>{format(date, "dd/MM/yyyy", { locale: dateLocale })}</div>
          <div className="text-xs">
            {format(date, "hh:mm a", { locale: dateLocale })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }) => {
      const sale = row.original;

      return (
        <div className="flex justify-end w-full">
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
              <DropdownMenuItem onClick={() => onView(sale)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("view")}
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(sale)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("edit")}
                </DropdownMenuItem>
              )}
              {isDraftTable && onCloseSale && (
                <DropdownMenuItem onClick={() => onCloseSale(sale)}>
                  <Check className="mr-2 h-4 w-4" />
                  {t("closeSale")}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(sale)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
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
