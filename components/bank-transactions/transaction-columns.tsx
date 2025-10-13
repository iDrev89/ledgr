"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { format } from "date-fns";

// Definir el enum localmente
enum BankTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUSTMENT = "ADJUSTMENT",
}
import { es } from "date-fns/locale";

interface CreateTransactionColumnsProps {
  onEdit: (transaction: BankTransactionWithRelations) => void;
  onDelete: (transaction: BankTransactionWithRelations) => void;
  t: (key: string) => string;
  locale?: string;
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numAmount);
};

const getTypeColor = (type: BankTransactionType) => {
  switch (type) {
    case BankTransactionType.INCOME:
    case BankTransactionType.TRANSFER_IN:
      return "text-green-600 dark:text-green-400";
    case BankTransactionType.EXPENSE:
    case BankTransactionType.TRANSFER_OUT:
      return "text-red-600 dark:text-red-400";
    default:
      return "text-blue-600 dark:text-blue-400";
  }
};

export const createTransactionColumns = ({
  onEdit,
  onDelete,
  t,
  locale = "es",
}: CreateTransactionColumnsProps): ColumnDef<BankTransactionWithRelations>[] => [
  {
    accessorKey: "transactionDate",
    header: t("date"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("transactionDate"));
      return (
        <div className="text-sm">
          {format(date, "PP", { locale: locale === "es" ? es : undefined })}
        </div>
      );
    },
  },
  {
    id: "bank",
    header: t("bank"),
    cell: ({ row }) => {
      const bank = row.original.bank;
      return (
        <div className="text-sm font-medium">
          {bank?.name || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: t("type"),
    cell: ({ row }) => {
      const type = row.getValue("type") as BankTransactionType;
      const typeMap = {
        [BankTransactionType.INCOME]: t("typeIncome"),
        [BankTransactionType.EXPENSE]: t("typeExpense"),
        [BankTransactionType.TRANSFER_IN]: t("typeTransferIn"),
        [BankTransactionType.TRANSFER_OUT]: t("typeTransferOut"),
        [BankTransactionType.ADJUSTMENT]: t("typeAdjustment"),
      };
      return <Badge variant="outline">{typeMap[type]}</Badge>;
    },
  },
  {
    accessorKey: "description",
    header: t("description"),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      const sale = row.original.salePayment?.sale;
      const receivable = row.original.receivablePayment?.receivable;
      const relatedBank = row.original.relatedBank;

      if (sale) {
        return (
          <div className="text-sm">
            <span className="font-medium">Venta #{sale.saleNumber}</span>
          </div>
        );
      }

      if (receivable) {
        return (
          <div className="text-sm">
            <span className="font-medium">Cobro de CxC</span>
          </div>
        );
      }

      if (relatedBank) {
        return (
          <div className="text-sm">
            <span className="font-medium">{relatedBank.name}</span>
          </div>
        );
      }

      return <div className="text-sm">{description || "-"}</div>;
    },
  },
  {
    accessorKey: "reference",
    header: t("reference"),
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string | null;
      return <div className="text-sm text-muted-foreground">{reference || "-"}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: t("amount"),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.type;
      const color = getTypeColor(type);
      const Icon = amount >= 0 ? ArrowUpRight : ArrowDownRight;

      return (
        <div className={`flex items-center gap-1 font-medium ${color}`}>
          <Icon className="h-4 w-4" />
          {formatCurrency(Math.abs(amount))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => {
      const transaction = row.original;
      const isLinked = !!(transaction.salePaymentId || transaction.receivablePaymentId);
      const isTransfer = transaction.type === BankTransactionType.TRANSFER_IN || 
                        transaction.type === BankTransactionType.TRANSFER_OUT;

      // No mostrar acciones para transacciones vinculadas o transferencias
      if (isLinked || isTransfer) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }

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
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(transaction)}
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

