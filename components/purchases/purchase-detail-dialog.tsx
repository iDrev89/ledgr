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
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { SerializedPurchase } from "@/lib/types/purchases";
import { useIsMobile } from "@/hooks/use-mobile";

interface PurchaseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: SerializedPurchase;
}

export function PurchaseDetailDialog({
  open,
  onOpenChange,
  purchase,
}: PurchaseDetailDialogProps) {
  const t = useTranslations("Purchases");
  const isMobile = useIsMobile();

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const content = (
    <div className="space-y-6 overflow-x-hidden">
      {/* Purchase Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier Information */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t("supplier")}</h3>
          <div className="bg-muted rounded-lg p-3">
            <p className="font-medium">
              {purchase.supplier ? purchase.supplier.name : t("noSupplier")}
            </p>
          </div>
        </div>

        {/* Created By Information */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t("createdBy")}</h3>
          <div className="bg-muted rounded-lg p-3 space-y-1">
            <p className="font-medium">
              {purchase.createdBy?.name || "Sistema"}
            </p>
            {purchase.createdBy && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(purchase.createdAt), "PPP p", { locale: es })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice No & Status */}
      <div className="flex flex-col sm:flex-row gap-4">
        {purchase.invoiceNo && (
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">{t("invoiceNo")}</h3>
            <div className="bg-muted rounded-lg p-3">
              <p className="font-mono font-medium">{purchase.invoiceNo}</p>
            </div>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2">{t("status")}</h3>
          <div className="bg-muted rounded-lg p-3">
            <Badge
              variant={purchase.status === "APPROVED" ? "default" : "secondary"}
            >
              {purchase.status === "APPROVED"
                ? "Aprobado"
                : purchase.status === "DRAFT"
                  ? "Borrador"
                  : purchase.status === "RECEIVED"
                    ? "Recibido"
                    : purchase.status === "CLOSED"
                      ? "Cerrado"
                      : purchase.status === "CANCELED"
                        ? "Cancelado"
                        : purchase.status}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">{t("paymentMethod")}</h3>
          <div className="bg-muted rounded-lg p-3">
            <Badge>
              {purchase.paymentMethod === "CASH" && t("paymentCash")}
              {purchase.paymentMethod === "BANK_TRANSFER" && t("paymentBankTransfer")}
            </Badge>
          </div>
        </div>

        {purchase.account && (
          <div>
            <h3 className="text-sm font-semibold mb-2">{t("destinationAccount")}</h3>
            <div className="bg-muted rounded-lg p-3">
              <p className="font-medium">{purchase.account.name}</p>
              {purchase.reference && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t("reference")}: {purchase.reference}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Items */}
      <div>
        <h3 className="text-sm font-semibold mb-3">{t("items")}</h3>
        {isMobile ? (
          /* Vista mobile con cards */
          <div className="space-y-3">
            {purchase.items.map((item) => (
              <Card key={item.id} className="border">
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{item.product.name}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("quantity")}</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("unitCost")}</p>
                      <p className="font-medium">
                        {formatCurrency(item.unitCost)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-semibold">{t("lineTotal")}</span>
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
                  <TableHead>{t("product")}</TableHead>
                  <TableHead className="text-right">{t("quantity")}</TableHead>
                  <TableHead className="text-right">{t("unitCost")}</TableHead>
                  <TableHead className="text-right">{t("lineTotal")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-medium">{item.product.name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitCost)}
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
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="font-medium">
              {formatCurrency(purchase.subtotal)}
            </span>
          </div>
          {parseFloat(purchase.taxTotal) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("taxes")}</span>
              <span className="font-medium">
                {formatCurrency(purchase.taxTotal)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">{t("total")}</span>
            <span className="text-lg font-bold">
              {formatCurrency(purchase.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      {purchase.note && (
        <div>
          <h3 className="text-sm font-semibold mb-2">{t("notes")}</h3>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">{purchase.note}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${t("purchaseDetail")}${purchase.purchaseNumber ? ` #${String(purchase.purchaseNumber).padStart(4, "0")}` : ""}`}
      description={format(new Date(purchase.createdAt), "PPP p", {
        locale: es,
      })}
      size="lg"
      mobileHeight="90vh"
    >
      {content}
    </ResponsiveDialog>
  );
}
