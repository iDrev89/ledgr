"use client";

import { Trash2, Calendar, Landmark, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CashCloseWithRelations } from "@/lib/types/cash-close";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface CashCloseCardProps {
  cashClose: CashCloseWithRelations;
  onDelete: () => void;
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numValue);
};

const getDifferenceColor = (difference: number) => {
  if (difference === 0) return "text-green-600";
  if (difference < 0) return "text-red-600";
  return "text-yellow-600";
};

export function CashCloseCard({ cashClose, onDelete }: CashCloseCardProps) {
  const t = useTranslations("CashClose");

  const difference = Number(cashClose.difference);

  return (
    <Card className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(cashClose.closeDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{cashClose.account.name}</span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={t("delete")}
              tabIndex={0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("expectedBalance")}
            </span>
            <span className="text-sm">
              {formatCurrency(Number(cashClose.expectedBalance))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("actualBalance")}
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(Number(cashClose.actualBalance))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("difference")}
            </span>
            <span
              className={cn("text-sm font-semibold", getDifferenceColor(difference))}
            >
              {formatCurrency(difference)}
            </span>
          </div>
        </div>

        {cashClose.branch && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                {cashClose.branch.name}
              </span>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span>
            {t("closedBy")}: {cashClose.closedBy.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
