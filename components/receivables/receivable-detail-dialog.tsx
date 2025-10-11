"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { ReceivableWithDetails } from "@/lib/types/receivables";
import { AccountsReceivableStatus, PaymentMethod } from "@/prisma/prisma-client";

interface ReceivableDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: ReceivableWithDetails | null;
  locale?: string;
}

export function ReceivableDetailDialog({
  open,
  onOpenChange,
  receivable,
  locale = "es",
}: ReceivableDetailDialogProps) {
  const t = useTranslations("Receivables");

  if (!receivable) return null;

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: t("paymentCash"),
      [PaymentMethod.CARD]: t("paymentCard"),
      [PaymentMethod.TRANSFER]: t("paymentTransfer"),
      [PaymentMethod.DIGITAL]: t("paymentDigital"),
      [PaymentMethod.OTHER]: t("paymentOther"),
    };
    return labels[method];
  };

  const getStatusBadge = (status: AccountsReceivableStatus) => {
    const config = {
      [AccountsReceivableStatus.OPEN]: {
        label: t("statusOpen"),
        variant: "destructive" as const,
      },
      [AccountsReceivableStatus.PARTIAL]: {
        label: t("statusPartial"),
        variant: "secondary" as const,
      },
      [AccountsReceivableStatus.PAID]: {
        label: t("statusPaid"),
        variant: "default" as const,
      },
      [AccountsReceivableStatus.CANCELED]: {
        label: t("statusCanceled"),
        variant: "outline" as const,
      },
    };

    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const dateLocale = locale === "es" ? es : enUS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("receivableDetail")}
            {receivable.sale && ` - Venta #${String(receivable.sale.saleNumber).padStart(4, "0")}`}
          </DialogTitle>
          <DialogDescription>
            {format(new Date(receivable.createdAt), "PPP p", { locale: dateLocale })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold mb-2">{t("customerInfo")}</h3>
            <div className="bg-muted rounded-lg p-4 space-y-1">
              <p className="font-medium">{receivable.customer.name}</p>
              {receivable.customer.email && (
                <p className="text-sm text-muted-foreground">
                  {t("email")}: {receivable.customer.email}
                </p>
              )}
              {receivable.customer.phone && (
                <p className="text-sm text-muted-foreground">
                  {t("phone")}: {receivable.customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Status and Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("status")}</h3>
              {getStatusBadge(receivable.status)}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("total")}</h3>
              <p className="text-xl font-bold">{formatCurrency(receivable.total)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("balance")}</h3>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(receivable.balance)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Payments */}
          {receivable.payments && receivable.payments.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3">{t("payments")}</h3>
                <div className="space-y-2">
                  {receivable.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-fit">
                            {getPaymentMethodLabel(payment.method)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.paidAt), "PPP p", { locale: dateLocale })}
                          </span>
                        </div>
                        {payment.bank && (
                          <span className="text-xs text-muted-foreground">
                            {payment.bank.name}
                            {payment.bank.accountNo && ` - ${payment.bank.accountNo}`}
                          </span>
                        )}
                        {payment.note && (
                          <span className="text-xs text-muted-foreground">
                            Nota: {payment.note}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t("totalPaid")}:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(
                      parseFloat(receivable.total) - parseFloat(receivable.balance)
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

