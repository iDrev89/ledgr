"use client";

import { Eye, Pencil, Trash2, Calendar, CreditCard, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExpenseWithDetails } from "@/lib/types/expenses";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface ExpenseCardProps {
  expense: ExpenseWithDetails;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
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

export function ExpenseCard({
  expense,
  onView,
  onEdit,
  onDelete,
  locale = "es",
}: ExpenseCardProps) {
  const t = useTranslations("Expenses");
  const dateLocale = locale === "es" ? es : enUS;

  const methodLabels: Record<string, string> = {
    CASH: t("paymentCash"),
    CARD: t("paymentCard"),
    TRANSFER: t("paymentTransfer"),
    DIGITAL: t("paymentDigital"),
    OTHER: t("paymentOther"),
  };

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Fecha + Monto + Acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(expense.incurredAt), "dd/MM/yyyy hh:mm a", {
                  locale: dateLocale,
                })}
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(parseFloat(expense.amount.toString()))}
            </p>
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
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Descripción y Categoría */}
        <div className="space-y-1">
          <p className="font-medium text-base">
            {expense.description || t("noDescription")}
          </p>
          {expense.category && (
            <Badge variant="outline" className="font-normal">
              {expense.category.name}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Detalles de Pago */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm">{methodLabels[expense.paymentMethod] || expense.paymentMethod}</p>
              {expense.paymentMethod === "TRANSFER" && expense.bank && (
                <p className="text-xs text-muted-foreground">{expense.bank.name}</p>
              )}
            </div>
          </div>

          {/* Factura o Referencia */}
          {(expense.invoiceNo || expense.reference) && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                {expense.invoiceNo && (
                  <p className="text-xs text-muted-foreground">
                    {t("invoiceNo")}: {expense.invoiceNo}
                  </p>
                )}
                {expense.reference && (
                  <p className="text-xs text-muted-foreground">
                    {t("reference")}: {expense.reference}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Proveedor */}
          {expense.supplier && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">{expense.supplier.name}</p>
            </div>
          )}
        </div>

        {/* Footer: Creado por */}
        {expense.createdBy && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("createdBy")}: {expense.createdBy.name}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

