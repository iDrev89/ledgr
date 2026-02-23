"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
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
import type { ExpenseWithDetails } from "@/lib/types/expenses";

interface CreateExpenseColumnsProps {
  onView: (expense: ExpenseWithDetails) => void;
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
  t: (key: string) => string;
  locale?: string;
}

export const createExpenseColumns = ({
  onView,
  onEdit,
  onDelete,
  t,
  locale = "es",
}: CreateExpenseColumnsProps): ColumnDef<ExpenseWithDetails>[] => [
  {
    accessorKey: "incurredAt",
    header: t("date"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("incurredAt"));
      const dateLocale = locale === "es" ? es : enUS;
      return (
        <div className="text-sm text-muted-foreground">
          <div>{format(date, "dd/MM/yyyy", { locale: dateLocale })}</div>
          <div className="text-xs">{format(date, "hh:mm a", { locale: dateLocale })}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: t("concept"),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      const category = row.original.category;
      const supplier = row.original.supplier;

      return (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">
            {description || t("noDescription")}
          </div>
          <div className="text-xs text-muted-foreground space-x-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
            )}
            {supplier && (
              <span className="text-muted-foreground">{supplier.name}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: t("paymentMethod"),
    cell: ({ row }) => {
      const paymentMethod = row.original.paymentMethod;
      const account = row.original.account;

      const methodLabels: Record<string, string> = {
        CASH: t("paymentCash"),
        BANK_TRANSFER: t("paymentBankTransfer"),
      };

      return (
        <div className="text-sm">
          <div>{methodLabels[paymentMethod] || paymentMethod}</div>
          {account && (
            <div className="text-xs text-muted-foreground">{account.name}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceNo",
    header: t("invoiceNo"),
    cell: ({ row }) => {
      const invoiceNo = row.getValue("invoiceNo") as string | null;
      return (
        <div className="text-sm text-muted-foreground">{invoiceNo || "-"}</div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">{t("amount")}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => {
      const expense = row.original;

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
            <DropdownMenuItem onClick={() => onView(expense)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(expense)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(expense)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
