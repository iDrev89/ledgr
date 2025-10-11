"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { SaleWithDetails } from "@/lib/types/sales";
import { PaymentMethod } from "@/prisma/prisma-client";

interface SaleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleWithDetails | null;
  locale?: string;
}

export function SaleDetailDialog({
  open,
  onOpenChange,
  sale,
  locale = "es",
}: SaleDetailDialogProps) {
  const t = useTranslations("Sales");

  if (!sale) return null;

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

  const dateLocale = locale === "es" ? es : enUS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("saleDetail")} #{String(sale.saleNumber).padStart(4, "0")}
          </DialogTitle>
          <DialogDescription>
            {format(new Date(sale.createdAt), "PPP p", { locale: dateLocale })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("customerInfo")}</h3>
              <div className="bg-muted rounded-lg p-4 space-y-1">
                <p className="font-medium">{sale.customer.name}</p>
                {sale.customer.email && (
                  <p className="text-sm text-muted-foreground">
                    {t("email")}: {sale.customer.email}
                  </p>
                )}
                {sale.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {t("phone")}: {sale.customer.phone}
                  </p>
                )}
                {sale.customer.docId && (
                  <p className="text-sm text-muted-foreground">
                    {t("docId")}: {sale.customer.docId}
                  </p>
                )}
              </div>
            </div>

            {/* Created By Information */}
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("createdBy")}</h3>
              <div className="bg-muted rounded-lg p-4 space-y-1">
                <p className="font-medium">{sale.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.createdBy.email}
                </p>
              </div>
            </div>
          </div>

          {/* Payments */}
          {sale.payments && sale.payments.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3">{t("payments")}</h3>
                <div className="space-y-2">
                  {sale.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit">
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                        {payment.bank && (
                          <span className="text-xs text-muted-foreground">
                            {payment.bank.name}
                            {payment.bank.accountNo && ` - ${payment.bank.accountNo}`}
                          </span>
                        )}
                        {payment.reference && (
                          <span className="text-xs text-muted-foreground">
                            Ref: {payment.reference}
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

              {sale.receivable && parseFloat(sale.receivable.balance) > 0 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {t("balance")}:
                    </span>
                    <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                      {formatCurrency(sale.receivable.balance)}
                    </span>
                  </div>
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    {t("totalPaid")}: {formatCurrency(
                      parseFloat(sale.total) - parseFloat(sale.receivable.balance)
                    )}
                  </span>
                </div>
              )}
            </>
          )}

          <Separator />

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("items")}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("product")}</TableHead>
                    <TableHead className="text-right">{t("quantity")}</TableHead>
                    <TableHead className="text-right">{t("unitPrice")}</TableHead>
                    <TableHead className="text-right">{t("discount")}</TableHead>
                    <TableHead className="text-right">{t("lineTotal")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.product.name}</span>
                          {item.product.sku && (
                            <span className="text-xs text-muted-foreground">
                              SKU: {item.product.sku}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(item.discount) > 0
                          ? `-${formatCurrency(item.discount)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">
                  {formatCurrency(sale.subtotal)}
                </span>
              </div>
              {parseFloat(sale.discountTotal) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("discountTotal")}
                  </span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(sale.discountTotal)}
                  </span>
                </div>
              )}
              {parseFloat(sale.taxTotal) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("taxTotal")}</span>
                  <span className="font-medium">
                    {formatCurrency(sale.taxTotal)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">{t("total")}</span>
                <span className="text-lg font-bold">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          {sale.note && (
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("note")}</h3>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{sale.note}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

