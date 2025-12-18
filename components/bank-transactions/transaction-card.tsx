"use client";

import { Calendar, Building2, FileText, ArrowUpRight, ArrowDownRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { BankTransactionType } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface TransactionCardProps {
  transaction: BankTransactionWithRelations;
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

const getTypeConfig = (type: BankTransactionType, t: (key: string) => string) => {
  const configs = {
    [BankTransactionType.INCOME]: {
      label: t("typeIncome"),
      variant: "default" as const,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      icon: <ArrowDownRight className="h-5 w-5" />,
    },
    [BankTransactionType.EXPENSE]: {
      label: t("typeExpense"),
      variant: "destructive" as const,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      icon: <ArrowUpRight className="h-5 w-5" />,
    },
    [BankTransactionType.TRANSFER_IN]: {
      label: t("typeTransferIn"),
      variant: "secondary" as const,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      icon: <ArrowDownRight className="h-5 w-5" />,
    },
    [BankTransactionType.TRANSFER_OUT]: {
      label: t("typeTransferOut"),
      variant: "secondary" as const,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      icon: <ArrowUpRight className="h-5 w-5" />,
    },
    [BankTransactionType.ADJUSTMENT]: {
      label: t("typeAdjustment"),
      variant: "outline" as const,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      icon: <FileText className="h-5 w-5" />,
    },
  };
  return configs[type];
};

export function TransactionCard({
  transaction,
  locale = "es",
}: TransactionCardProps) {
  const t = useTranslations("BankTransactions");
  const dateLocale = locale === "es" ? es : enUS;
  const typeConfig = getTypeConfig(transaction.type, t);

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Fecha + Tipo */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(transaction.transactionDate), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>
          <Badge variant={typeConfig.variant} className="shrink-0">
            {typeConfig.icon}
            <span className="ml-1">{typeConfig.label}</span>
          </Badge>
        </div>

        <Separator />

        {/* Banco */}
        {transaction.bank && (
          <>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm">{transaction.bank.name}</span>
            </div>
            <Separator />
          </>
        )}

        {/* Descripción */}
        <div>
          <p className="font-medium text-base">
            {transaction.description || t("noDescription")}
          </p>
        </div>

        {/* Referencia */}
        {transaction.reference && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t("reference")}</p>
                <p className="text-sm font-mono">{transaction.reference}</p>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Monto */}
        <div className={`${typeConfig.bgColor} rounded-md p-3`}>
          <p className="text-xs text-muted-foreground mb-1">{t("amount")}</p>
          <p className={`text-2xl font-bold ${typeConfig.color}`}>
            {formatCurrency(parseFloat(transaction.amount.toString()))}
          </p>
        </div>

        {/* Footer: Creado por */}
        {transaction.createdBy && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>
                {t("createdBy")}: {transaction.createdBy.name}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

