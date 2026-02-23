"use client";

import { useTranslations } from "next-intl";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { SaleWithDetails } from "@/lib/types/sales";
import { PaymentMethod } from "@/prisma/prisma-client";
import { getPaymentMethodLabel } from "@/lib/payment-utils";
import { ImageViewerDialog } from "@/components/shared/image-viewer-dialog";

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

  const getMethodLabel = (method: PaymentMethod) =>
    getPaymentMethodLabel(method, t);

  const dateLocale = locale === "es" ? es : enUS;

  const hasSoldBy = sale.soldBy && sale.soldBy.id !== sale.createdBy.id;
  const hasReceivable = sale.receivable && parseFloat(sale.receivable.balance) > 0;

  const content = (
    <div className="space-y-5 px-1">

      {/* Metadata — single ledger panel */}
      <div className="rounded-md border px-3 py-1">
        {/* Cliente */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 pt-0.5">
            {t("customer")}
          </span>
          <div className="text-right min-w-0">
            <p className="font-medium text-sm">{sale.customer.name}</p>
            {sale.customer.phone && (
              <p className="text-xs text-muted-foreground">{sale.customer.phone}</p>
            )}
            {sale.customer.email && (
              <p className="text-xs text-muted-foreground truncate">{sale.customer.email}</p>
            )}
            {sale.customer.docId && (
              <p className="text-xs text-muted-foreground font-mono">{sale.customer.docId}</p>
            )}
          </div>
        </div>

        {/* Registrado por */}
        <div className={`flex items-start justify-between gap-4 py-2 ${hasSoldBy ? "border-b border-border/40" : ""}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 pt-0.5">
            {t("createdBy")}
          </span>
          <div className="text-right min-w-0">
            <p className="font-medium text-sm">{sale.createdBy.name}</p>
            <p className="text-xs text-muted-foreground truncate">{sale.createdBy.email}</p>
          </div>
        </div>

        {/* Vendedor — solo si es diferente */}
        {hasSoldBy && sale.soldBy && (
          <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 pt-0.5">
              {t("soldBy")}
            </span>
            <div className="text-right min-w-0">
              <p className="font-medium text-sm text-info">{sale.soldBy.name}</p>
              <p className="text-xs text-muted-foreground truncate">{sale.soldBy.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagos */}
      {sale.payments && sale.payments.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {t("payments")}
          </p>
          <div className="rounded-md border overflow-hidden divide-y divide-border">
            {sale.payments.map((payment) => (
              <div key={payment.id}>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <Badge variant="secondary" className="font-medium w-fit">
                      {getMethodLabel(payment.method)}
                    </Badge>
                    {payment.account && (
                      <span className="text-xs text-muted-foreground">
                        {payment.account.name}
                        {payment.account.accountNumber && ` · ${payment.account.accountNumber}`}
                      </span>
                    )}
                    {payment.reference && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {payment.reference}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-semibold tabular-nums shrink-0">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                {payment.attachmentUrl && (
                  <div className="px-3 pb-2.5">
                    <ImageViewerDialog
                      imageUrl={payment.attachmentUrl}
                      title={t("paymentAttachmentTitle")}
                      buttonText={t("paymentViewAttachment")}
                      buttonVariant="outline"
                      buttonSize="sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Saldo pendiente — Status Banner */}
          {hasReceivable && sale.receivable && (
            <div className="mt-2 flex items-center justify-between gap-4 rounded-md border border-l-2 border-l-warning px-4 py-2.5 text-sm">
              <span className="font-medium text-warning-foreground">{t("balance")}</span>
              <div className="text-right">
                <p className="font-mono tabular-nums font-bold text-warning">
                  {formatCurrency(sale.receivable.balance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("totalPaid")}: {formatCurrency(
                    parseFloat(sale.total) - parseFloat(sale.receivable.balance),
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Productos */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {t("items")}
        </p>
        <div className="rounded-md border overflow-hidden divide-y divide-border">
          {sale.items.map((item) => (
            <div key={item.id} className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-snug">{item.product.name}</p>
                  {item.product.sku && (
                    <p className="text-xs text-muted-foreground font-mono">SKU: {item.product.sku}</p>
                  )}
                </div>
                <span className="font-mono tabular-nums font-semibold text-sm shrink-0">
                  {formatCurrency(item.lineTotal)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </span>
                {parseFloat(item.discount) > 0 && (
                  <span className="text-destructive">
                    − {formatCurrency(item.discount)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totales — Summary Rows */}
      <div className="rounded-md border overflow-hidden divide-y divide-border">
        <div className="flex justify-between items-center text-sm px-3 py-2">
          <span className="text-muted-foreground">{t("subtotal")}:</span>
          <span className="font-mono tabular-nums font-medium">
            {formatCurrency(sale.subtotal)}
          </span>
        </div>
        {parseFloat(sale.discountTotal) > 0 && (
          <div className="flex justify-between items-center text-sm px-3 py-2">
            <span className="text-muted-foreground">{t("discountTotal")}:</span>
            <span className="font-mono tabular-nums font-medium text-destructive">
              −{formatCurrency(sale.discountTotal)}
            </span>
          </div>
        )}
        {parseFloat(sale.taxTotal) > 0 && (
          <div className="flex justify-between items-center text-sm px-3 py-2">
            <span className="text-muted-foreground">{t("taxTotal")}:</span>
            <span className="font-mono tabular-nums font-medium">
              {formatCurrency(sale.taxTotal)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center px-3 py-3">
          <span className="font-semibold">{t("total")}:</span>
          <span className="font-mono tabular-nums text-xl font-bold text-success">
            {formatCurrency(sale.total)}
          </span>
        </div>
      </div>

      {/* Nota */}
      {sale.note && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {t("note")}
          </p>
          <div className="rounded-md border px-3 py-2.5">
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
