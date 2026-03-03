"use client";

import { Eye, Trash2, Calendar, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReconciliationWithRelations } from "@/lib/types/reconciliation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReconciliationCardProps {
  reconciliation: ReconciliationWithRelations;
  onView: () => void;
  onDelete: () => void;
  locale?: string;
}

const formatCurrency = (value: unknown) => {
  const numValue = Number(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numValue);
};

const statusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default" as const;
    case "IN_PROGRESS":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

const statusClassName = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "DRAFT":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "";
  }
};

export function ReconciliationCard({
  reconciliation,
  onView,
  onDelete,
  locale = "es",
}: ReconciliationCardProps) {
  const t = useTranslations("Reconciliation");
  const dateLocale = locale === "es" ? es : enUS;
  const diff = Number(reconciliation.difference);

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">
                {reconciliation.account?.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(reconciliation.periodStart), "dd/MM/yyyy", {
                  locale: dateLocale,
                })}{" "}
                –{" "}
                {format(new Date(reconciliation.periodEnd), "dd/MM/yyyy", {
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              aria-label={t("view")}
              tabIndex={0}
            >
              <Eye className="h-4 w-4" />
            </Button>
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

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">{t("openingBalance")}</p>
            <p className="font-medium">
              {formatCurrency(reconciliation.openingBalance)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("closingBalance")}</p>
            <p className="font-medium">
              {formatCurrency(reconciliation.closingBalance)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("statementBalance")}</p>
            <p className="font-medium">
              {formatCurrency(reconciliation.statementBalance)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("difference")}</p>
            <p
              className={cn(
                "font-medium",
                diff === 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {formatCurrency(diff)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Badge
            variant={statusVariant(reconciliation.status)}
            className={statusClassName(reconciliation.status)}
          >
            {t(`status_${reconciliation.status}`)}
          </Badge>
          {reconciliation.reconciledBy && (
            <span className="text-xs text-muted-foreground">
              {t("reconciledBy")}: {reconciliation.reconciledBy.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
