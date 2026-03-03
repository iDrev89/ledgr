"use client";

import {
  Pencil,
  Trash2,
  Building2,
  CreditCard,
  ArrowUpDown,
  Landmark,
  Wallet,
  Banknote,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AccountWithRelations } from "@/lib/types/account";
import { AccountType } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";

interface AccountCardProps {
  account: AccountWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getAccountTypeIcon = (type: AccountType) => {
  switch (type) {
    case AccountType.BANK:
      return <Landmark className="h-4 w-4" />;
    case AccountType.CASH_REGISTER:
      return <Banknote className="h-4 w-4" />;
    case AccountType.PETTY_CASH:
      return <Wallet className="h-4 w-4" />;
    case AccountType.DIGITAL_WALLET:
      return <CircleDollarSign className="h-4 w-4" />;
    case AccountType.CREDIT_LINE:
      return <CreditCard className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
};

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const t = useTranslations("Accounts");
  const balance = (account as any).currentBalance || 0;
  const transactionCount = (account as any).transactionCount || 0;

  const typeLabels: Record<string, string> = {
    [AccountType.BANK]: t("typeBankLabel"),
    [AccountType.CASH_REGISTER]: t("typeCashRegister"),
    [AccountType.PETTY_CASH]: t("typePettyCash"),
    [AccountType.DIGITAL_WALLET]: t("typeDigitalWallet"),
    [AccountType.CREDIT_LINE]: t("typeCreditLine"),
  };

  return (
    <Card className="rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-sm truncate">{account.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-xs gap-1">
                {getAccountTypeIcon(account.type)}
                {typeLabels[account.type] || account.type}
              </Badge>
              <Badge
                variant={account.active ? "default" : "secondary"}
                className="text-xs"
              >
                {account.active ? t("active") : t("inactive")}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {account.institution && (
          <div className="flex items-center gap-2">
            <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {account.institution}
            </span>
          </div>
        )}

        {account.accountNumber && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {account.accountNumber}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("balance")}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("transactions")}:</span>
          <span className="font-medium">{transactionCount}</span>
        </div>

        {account._count && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{account._count.salePayments}</p>
              <p className="text-muted-foreground">{t("salePayments")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{account._count.receivablePayments}</p>
              <p className="text-muted-foreground">{t("receivablePayments")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{account._count.purchases}</p>
              <p className="text-muted-foreground">{t("purchases")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
