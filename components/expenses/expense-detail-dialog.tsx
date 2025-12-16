"use client";

import { useTranslations } from "next-intl";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExpenseWithDetails } from "@/lib/types/expenses";

interface ExpenseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ExpenseWithDetails | null;
  locale?: string;
}

export function ExpenseDetailDialog({
  open,
  onOpenChange,
  expense,
  locale = "es",
}: ExpenseDetailDialogProps) {
  const t = useTranslations("Expenses");

  if (!expense) return null;

  const formatCurrency = (value: string | number) => {
    const amount = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const methodLabels: Record<string, string> = {
    CASH: t("paymentCash"),
    CARD: t("paymentCard"),
    TRANSFER: t("paymentTransfer"),
    DIGITAL: t("paymentDigital"),
    OTHER: t("paymentOther"),
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("expenseDetail")}
      size="md"
    >
      <div className="space-y-6">
        {/* Amount */}
        <div className="bg-primary/5 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t("amount")}</p>
          <p className="text-3xl font-bold">{formatCurrency(parseFloat(expense.amount.toString()))}</p>
        </div>

          {/* Date and Invoice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("date")}</h3>
              <p className="text-sm">{formatDate(expense.incurredAt)}</p>
            </div>
            {expense.invoiceNo && (
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("invoiceNo")}</h3>
                <p className="text-sm">{expense.invoiceNo}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("paymentMethod")}</h3>
              <Badge variant="outline">
                {methodLabels[expense.paymentMethod] || expense.paymentMethod}
              </Badge>
            </div>
            {expense.paymentMethod === "TRANSFER" && expense.bank && (
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("bank")}</h3>
                <p className="text-sm">{expense.bank.name}</p>
              </div>
            )}
          </div>

          {/* Reference (for transfers) */}
          {expense.paymentMethod === "TRANSFER" && expense.reference && (
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("reference")}</h3>
              <p className="text-sm text-muted-foreground">{expense.reference}</p>
            </div>
          )}

          <Separator />

          {/* Category and Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expense.category && (
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("category")}</h3>
                <Badge variant="outline">{expense.category.name}</Badge>
              </div>
            )}
            {expense.supplier && (
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("supplier")}</h3>
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-medium">{expense.supplier.name}</p>
                  {expense.supplier.email && (
                    <p className="text-xs text-muted-foreground">
                      {expense.supplier.email}
                    </p>
                  )}
                  {expense.supplier.phone && (
                    <p className="text-xs text-muted-foreground">
                      {expense.supplier.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {expense.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("description")}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {expense.description}
                </p>
              </div>
            </>
          )}

          {/* Created By */}
          {expense.createdBy && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("createdBy")}</h3>
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-medium">{expense.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.createdBy.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(expense.createdAt)}
                  </p>
                </div>
              </div>
            </>
          )}
      </div>
    </ResponsiveDialog>
  );
}

