"use client";

import {
  Pencil,
  Trash2,
  Building2,
  CreditCard,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BankWithRelations } from "@/lib/types/bank";
import { useTranslations } from "next-intl";

interface BankCardProps {
  bank: BankWithRelations;
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

export function BankCard({ bank, onEdit, onDelete }: BankCardProps) {
  const t = useTranslations("Banks");
  const balance = (bank as any).currentBalance || 0;
  const transactionCount = (bank as any).transactionCount || 0;

  return (
    <Card className="rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header: Nombre + Estado + Acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-sm truncate">{bank.name}</h3>
            </div>
            <Badge
              variant={bank.active ? "default" : "secondary"}
              className="mt-1.5 text-xs"
            >
              {bank.active ? t("active") : t("inactive")}
            </Badge>
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

        {/* Número de Cuenta */}
        {bank.accountNo && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {bank.accountNo}
            </span>
          </div>
        )}

        {/* Balance */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("balance")}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Transacciones */}
        <div className="flex items-center gap-2 text-sm">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("transactions")}:</span>
          <span className="font-medium">{transactionCount}</span>
        </div>

        {/* Contadores adicionales si existen */}
        {bank._count && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{bank._count.salePayments}</p>
              <p className="text-muted-foreground">{t("salePayments")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{bank._count.receivablePayments}</p>
              <p className="text-muted-foreground">{t("receivablePayments")}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/50">
              <p className="font-medium">{bank._count.purchases}</p>
              <p className="text-muted-foreground">{t("purchases")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
