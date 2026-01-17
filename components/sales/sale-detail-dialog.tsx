"use client";

import { useTranslations } from "next-intl";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
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
import { ImageViewerDialog } from "@/components/shared/image-viewer-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile(); // Todavía se usa dentro del contenido para items

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

  // Contenido compartido entre Dialog y Sheet
  const content = (
    <div className="space-y-6 overflow-x-hidden">
      {/* Sale Information - Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Information */}
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("customerInfo")}
          </h3>
          <div className="bg-card ring-1 ring-border rounded-lg p-4 space-y-1">
            <div className="flex items-start gap-3 border-l-2 border-primary pl-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {sale.customer.name}
                </p>
                {sale.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {sale.customer.phone}
                  </p>
                )}
                {sale.customer.email && (
                  <p className="text-sm text-muted-foreground truncate">
                    {sale.customer.email}
                  </p>
                )}
                {sale.customer.docId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("docId")}: {sale.customer.docId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Created By Information */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("createdBy")}
          </h3>
          <div className="bg-card ring-1 ring-border rounded-lg p-4">
            <div className="flex items-start gap-3 border-l-2 border-muted-foreground/30 pl-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {sale.createdBy.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {sale.createdBy.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sold By Information - only show if different from createdBy */}
      {sale.soldBy && sale.soldBy.id !== sale.createdBy.id && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("soldBy")}
          </h3>
          <div className="bg-info/5 ring-1 ring-info/30 rounded-lg p-4">
            <div className="flex items-start gap-3 border-l-2 border-info pl-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-info">{sale.soldBy.name}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.soldBy.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Section */}
      {sale.payments && sale.payments.length > 0 && (
        <>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {t("payments")}
            </h3>
            <div className="space-y-2">
              {sale.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-card ring-1 ring-border rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium">
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                      </div>
                      {payment.bank && (
                        <span className="text-xs text-muted-foreground">
                          {payment.bank.name}
                          {payment.bank.accountNo &&
                            ` - ${payment.bank.accountNo}`}
                        </span>
                      )}
                      {payment.reference && (
                        <span className="text-xs text-muted-foreground font-mono">
                          Ref: {payment.reference}
                        </span>
                      )}
                    </div>

                    <span className="font-bold text-lg tabular-nums shrink-0">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>

                  {/* Botón para ver comprobante si existe */}
                  {payment.attachmentUrl && (
                    <div className="px-4 pb-4 pt-0">
                      <ImageViewerDialog
                        imageUrl={payment.attachmentUrl}
                        title={t("paymentAttachmentTitle")}
                        buttonText={t("paymentViewAttachment")}
                        buttonVariant="outline"
                        buttonSize="default"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {sale.receivable && parseFloat(sale.receivable.balance) > 0 && (
            <div className="p-4 rounded-lg bg-warning/10 ring-1 ring-warning/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-warning-foreground">
                  {t("balance")}
                </span>
                <span className="text-lg font-bold text-warning">
                  {formatCurrency(sale.receivable.balance)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("totalPaid")}:{" "}
                {formatCurrency(
                  parseFloat(sale.total) - parseFloat(sale.receivable.balance),
                )}
              </span>
            </div>
          )}
        </>
      )}

      <Separator />

      {/* Items */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("items")}
        </h3>
        {isMobile ? (
          /* Vista mobile con cards */
          <div className="space-y-3">
            {sale.items.map((item) => (
              <div
                key={item.id}
                className="bg-card ring-1 ring-border rounded-lg overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{item.product.name}</p>
                    {item.product.sku && (
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.product.sku}
                      </p>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("quantity")}</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("unitPrice")}</p>
                      <p className="font-medium">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    {parseFloat(item.discount) > 0 && (
                      <div>
                        <p className="text-muted-foreground">{t("discount")}</p>
                        <p className="font-medium text-destructive">
                          -{formatCurrency(item.discount)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="font-medium text-sm">
                      {t("lineTotal")}
                    </span>
                    <span className="font-bold text-base tabular-nums">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista desktop con tabla */
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
        <div className="w-full sm:w-72 bg-card ring-1 ring-border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(sale.subtotal)}
            </span>
          </div>
          {parseFloat(sale.discountTotal) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("discountTotal")}
              </span>
              <span className="font-medium text-destructive tabular-nums">
                -{formatCurrency(sale.discountTotal)}
              </span>
            </div>
          )}
          {parseFloat(sale.taxTotal) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("taxTotal")}</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(sale.taxTotal)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center pt-1">
            <span className="font-semibold">{t("total")}</span>
            <span className="text-lg font-bold text-success tabular-nums">
              {formatCurrency(sale.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      {sale.note && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("note")}
          </h3>
          <div className="bg-muted/50 ring-1 ring-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{sale.note}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${t("saleDetail")} #${String(sale.saleNumber).padStart(4, "0")}`}
      description={format(new Date(sale.createdAt), "dd/MM/yyyy hh:mm a", {
        locale: dateLocale,
      })}
      size="lg"
      mobileHeight="90vh"
    >
      {content}
    </ResponsiveDialog>
  );
}
