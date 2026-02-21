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
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { ReceivableWithDetails } from "@/lib/types/receivables";
import { AccountsReceivableStatus } from "@/prisma/prisma-client";
import { getPaymentMethodLabel } from "@/lib/payment-utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const tSales = useTranslations("Sales");
  const isMobile = useIsMobile();

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

  const getMethodLabel = (method: string) =>
    getPaymentMethodLabel(method, t);

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
            {receivable.sale &&
              ` - Venta #${String(receivable.sale.saleNumber).padStart(4, "0")}`}
          </DialogTitle>
          <DialogDescription>
            {format(new Date(receivable.createdAt), "PPP p", {
              locale: dateLocale,
            })}
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
              <p className="text-xl font-bold">
                {formatCurrency(receivable.total)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("balance")}</h3>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(receivable.balance)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Sale Items */}
          {receivable.sale && receivable.sale.items && receivable.sale.items.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3">{tSales("items")}</h3>
                {isMobile ? (
                  /* Vista mobile con cards */
                  <div className="space-y-3">
                    {receivable.sale.items.map((item) => (
                      <Card key={item.id} className="border">
                        <CardContent className="p-3 space-y-3">
                          <div className="space-y-1">
                            <p className="font-semibold">{item.product.name}</p>
                            {item.product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.product.sku}
                              </p>
                            )}
                            {item.performedBy && (
                              <p className="text-xs text-muted-foreground">
                                {tSales("performedBy")}: {item.performedBy.name}
                              </p>
                            )}
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">{tSales("quantity")}</p>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{tSales("unitPrice")}</p>
                              <p className="font-medium">
                                {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            {parseFloat(item.discount) > 0 && (
                              <div>
                                <p className="text-muted-foreground">{tSales("discount")}</p>
                                <p className="font-medium text-destructive">
                                  -{formatCurrency(item.discount)}
                                </p>
                              </div>
                            )}
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center pt-1">
                            <span className="font-semibold">{tSales("lineTotal")}</span>
                            <span className="text-lg font-bold">
                              {formatCurrency(item.lineTotal)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Vista desktop con tabla */
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{tSales("product")}</TableHead>
                          <TableHead className="text-right">{tSales("quantity")}</TableHead>
                          <TableHead className="text-right">{tSales("unitPrice")}</TableHead>
                          <TableHead className="text-right">{tSales("discount")}</TableHead>
                          <TableHead className="text-right">{tSales("lineTotal")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receivable.sale.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.product.name}</span>
                                {item.product.sku && (
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {item.product.sku}
                                  </span>
                                )}
                                {item.performedBy && (
                                  <span className="text-xs text-muted-foreground">
                                    {tSales("performedBy")}: {item.performedBy.name}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
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
                )}
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2">
                  {receivable.sale.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tSales("subtotal")}</span>
                      <span className="font-medium">{formatCurrency(receivable.sale.subtotal)}</span>
                    </div>
                  )}
                  {receivable.sale.discountTotal && parseFloat(receivable.sale.discountTotal) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {tSales("discountTotal")}
                      </span>
                      <span className="font-medium text-destructive">
                        -{formatCurrency(receivable.sale.discountTotal)}
                      </span>
                    </div>
                  )}
                  {receivable.sale.taxTotal && parseFloat(receivable.sale.taxTotal) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tSales("taxTotal")}</span>
                      <span className="font-medium">
                        {formatCurrency(receivable.sale.taxTotal)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">{t("total")}</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(receivable.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {receivable.sale.note && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">{tSales("note")}</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{receivable.sale.note}</p>
                  </div>
                </div>
              )}

              <Separator />
            </>
          )}

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
                            {getMethodLabel(payment.method)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.paidAt), "PPP p", {
                              locale: dateLocale,
                            })}
                          </span>
                        </div>
                        {payment.account && (
                          <span className="text-xs text-muted-foreground">
                            {payment.account.name}
                            {payment.account.accountNumber &&
                              ` - ${payment.account.accountNumber}`}
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
                      parseFloat(receivable.total) -
                        parseFloat(receivable.balance),
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
