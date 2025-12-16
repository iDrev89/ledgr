"use client";

import { Eye, Trash2, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { SaleWithDetails } from "@/lib/types/sales";
import { PaymentMethod } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";

interface SaleCardProps {
  sale: SaleWithDetails;
  onView: () => void;
  onDelete?: () => void;
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

const getPaymentMethodBadge = (method: PaymentMethod, t: (key: string) => string) => {
  const variants: Record<PaymentMethod, { label: string; variant: "default" | "secondary" | "outline" }> = {
    [PaymentMethod.CASH]: {
      label: t("paymentCash"),
      variant: "default",
    },
    [PaymentMethod.CARD]: {
      label: t("paymentCard"),
      variant: "secondary",
    },
    [PaymentMethod.TRANSFER]: {
      label: t("paymentTransfer"),
      variant: "outline",
    },
    [PaymentMethod.DIGITAL]: {
      label: t("paymentDigital"),
      variant: "secondary",
    },
    [PaymentMethod.OTHER]: {
      label: t("paymentOther"),
      variant: "outline",
    },
  };

  const config = variants[method];
  return (
    <Badge variant={config.variant} className="font-normal">
      {config.label}
    </Badge>
  );
};

export function SaleCard({ sale, onView, onDelete, locale = "es" }: SaleCardProps) {
  const t = useTranslations("Sales");
  const dateLocale = locale === "es" ? es : enUS;
  const hasReceivable = sale.receivable && parseFloat(sale.receivable.balance) > 0;

  // Obtener método de pago principal
  const primaryPayment = sale.payments && sale.payments.length > 0 ? sale.payments[0] : null;
  const hasMultiplePayments = sale.payments && sale.payments.length > 1;

  return (
    <Card 
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Número de venta + Fecha + Botón eliminar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg">
                #{String(sale.saleNumber).padStart(4, "0")}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(sale.createdAt), { 
                  addSuffix: true, 
                  locale: dateLocale 
                })}
              </span>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator />

        {/* Cliente */}
        <div className="space-y-1">
          <p className="font-semibold text-base">{sale.customer.name}</p>
          {sale.customer.email && (
            <p className="text-xs text-muted-foreground truncate">
              {sale.customer.email}
            </p>
          )}
        </div>

        <Separator />

        {/* Items */}
        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {sale.items.length} {sale.items.length === 1 ? t("item") : t("items")}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {sale.items.slice(0, 2).map((item) => item.product.name).join(", ")}
              {sale.items.length > 2 && ` +${sale.items.length - 2}`}
            </p>
          </div>
        </div>

        {/* Pagos */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
          {sale.payments && sale.payments.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {primaryPayment && !hasMultiplePayments && getPaymentMethodBadge(primaryPayment.method, t)}
              {hasMultiplePayments && (
                <Badge variant="secondary" className="font-normal">
                  {sale.payments.length} {t("payments")}
                </Badge>
              )}
            </div>
          ) : (
            <Badge variant="outline" className="font-normal">
              {t("noPayments")}
            </Badge>
          )}
        </div>

        {/* Balance pendiente */}
        {hasReceivable && sale.receivable && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              ⚠️ {t("balance")}: {formatCurrency(sale.receivable.balance)}
            </p>
          </div>
        )}

        <Separator />

        {/* Footer: Total + Botón Ver */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="text-xl font-bold">{formatCurrency(sale.total)}</p>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("view")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


