"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { BankTransactionType } from "@/prisma/prisma-client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CreateTransactionColumnsProps {
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
      return <div className="text-sm font-medium">{bank?.name || "-"}</div>;
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
    header: t("descriptionLabel"),
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
      return (
        <div className="text-sm text-muted-foreground">{reference || "-"}</div>
      );
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
];
