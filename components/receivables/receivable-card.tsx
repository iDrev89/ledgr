"use client";

import { Eye, DollarSign, XCircle, User, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReceivableWithDetails } from "@/lib/types/receivables";
import { AccountsReceivableStatus } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface ReceivableCardProps {
  receivable: ReceivableWithDetails;
  onView: () => void;
  onPayment: () => void;
  onCancel: () => void;
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

const getStatusBadge = (status: AccountsReceivableStatus, t: (key: string) => string) => {
  const variants: Record<AccountsReceivableStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    [AccountsReceivableStatus.OPEN]: {
      label: t("statusOpen"),
      variant: "destructive",
    },
    [AccountsReceivableStatus.PARTIAL]: {
      label: t("statusPartial"),
      variant: "secondary",
    },
    [AccountsReceivableStatus.PAID]: {
      label: t("statusPaid"),
      variant: "default",
    },
    [AccountsReceivableStatus.CANCELED]: {
      label: t("statusCanceled"),
      variant: "outline",
    },
  };

  const config = variants[status];
  return (
    <Badge variant={config.variant} className="font-normal">
      {config.label}
    </Badge>
  );
};

export function ReceivableCard({
  receivable,
  onView,
  onPayment,
  onCancel,
  locale = "es",
}: ReceivableCardProps) {
  const t = useTranslations("Receivables");
  const dateLocale = locale === "es" ? es : enUS;
  const isPending = receivable.status !== AccountsReceivableStatus.PAID && receivable.status !== AccountsReceivableStatus.CANCELED;
  const balance = parseFloat(receivable.balance);
  const hasPendingBalance = balance > 0;

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: #Venta + Estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg">
                #{String(receivable.sale?.saleNumber || 0).padStart(4, "0")}
              </span>
              {getStatusBadge(receivable.status, t)}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(receivable.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          </div>
        </div>

        <Separator />

        {/* Cliente */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">
              {receivable.customer.name}
            </p>
            {receivable.customer.email && (
              <p className="text-xs text-muted-foreground truncate">
                {receivable.customer.email}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Detalles de Montos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("total")}</span>
            <span className="font-medium">{formatCurrency(receivable.total)}</span>
          </div>
          
          {hasPendingBalance && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    {t("balance")}
                  </p>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    {formatCurrency(receivable.balance)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Footer: Botones de Acción */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("view")}
          </Button>
          
          {isPending && hasPendingBalance && (
            <>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayment();
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {t("registerPayment")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

