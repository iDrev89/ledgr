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

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("paymentMethod")}</span>
            <Badge variant="secondary">
              {getPaymentMethodLabel(sale.paymentMethod)}
            </Badge>
          </div>

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
                        {formatCurrency(item.unitPrice.toNumber())}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount.toNumber() > 0
                          ? `-${formatCurrency(item.discount.toNumber())}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.lineTotal.toNumber())}
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
                  {formatCurrency(sale.subtotal.toNumber())}
                </span>
              </div>
              {sale.discountTotal.toNumber() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("discountTotal")}
                  </span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(sale.discountTotal.toNumber())}
                  </span>
                </div>
              )}
              {sale.taxTotal.toNumber() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("taxTotal")}</span>
                  <span className="font-medium">
                    {formatCurrency(sale.taxTotal.toNumber())}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">{t("total")}</span>
                <span className="text-lg font-bold">
                  {formatCurrency(sale.total.toNumber())}
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

