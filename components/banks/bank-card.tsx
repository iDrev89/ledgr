"use client";

import { Pencil, Trash2, Building2, CreditCard, TrendingUp, ShoppingCart, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export function BankCard({
  bank,
  onEdit,
  onDelete,
}: BankCardProps) {
  const t = useTranslations("Banks");
  const balance = (bank as any).currentBalance || 0;
  const transactionCount = (bank as any).transactionCount || 0;

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Nombre + Estado + Acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-lg truncate">{bank.name}</h3>
            </div>
            <Badge variant={bank.active ? "default" : "outline"} className="mt-1">
              {bank.active ? t("active") : t("inactive")}
            </Badge>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Número de Cuenta */}
        {bank.accountNo && (
          <>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-mono">{bank.accountNo}</span>
            </div>
            <Separator />
          </>
        )}

        {/* Balance */}
        <div className="bg-primary/5 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">{t("balance")}</p>
          <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
        </div>

        <Separator />

        {/* Contadores */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t("transactions")}</p>
              <p className="text-sm font-medium">{transactionCount}</p>
            </div>
          </div>

          {bank._count && (
            <>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("salePayments")}</p>
                  <p className="text-sm font-medium">{bank._count.salePayments}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("receivablePayments")}</p>
                  <p className="text-sm font-medium">{bank._count.receivablePayments}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("purchases")}</p>
                  <p className="text-sm font-medium">{bank._count.purchases}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

