"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@/prisma/prisma-client";
import { useAccounts } from "@/hooks/use-accounts";
import { AttachmentUpload } from "@/components/shared/attachment-upload";
import type { SalePaymentInput } from "@/lib/validations/sales";
import {
  getDefaultAccountForMethod,
  getPaymentMethodLabel as getMethodLabel,
  getAccountTypeLabel,
} from "@/lib/payment-utils";
import { cn } from "@/lib/utils";

export type SalePaymentRow = SalePaymentInput & {
  tempId: string;
};

interface SalePaymentsProps {
  payments: SalePaymentRow[];
  onPaymentsChange: (payments: SalePaymentRow[]) => void;
  total: number;
  disabled?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Payment methods shown as quick-add chips
const QUICK_METHODS = [
  PaymentMethod.CASH,
  PaymentMethod.BANK_TRANSFER,
];

export function SalePayments({
  payments,
  onPaymentsChange,
  total,
  disabled,
}: SalePaymentsProps) {
  const t = useTranslations("Sales");
  const tAccounts = useTranslations("Accounts");
  const { data: accountsData } = useAccounts({ activeOnly: true });
  const accounts = accountsData?.accounts || [];
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const totalPaid = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0,
  );
  const balance = total - totalPaid;
  const editingPayment = payments.find((p) => p.tempId === editingPaymentId);

  const addPayment = (method: PaymentMethod) => {
    // Default amount = remaining balance (if positive), else empty
    const defaultAmount = balance > 0 ? balance.toString() : "";
    const newPayment: SalePaymentRow = {
      tempId: `temp-${Date.now()}`,
      amount: defaultAmount,
      method,
      accountId:
        getDefaultAccountForMethod(method, accounts) || "",
      reference: "",
      attachmentUrl: "",
    };
    onPaymentsChange([...payments, newPayment]);
    setEditingPaymentId(newPayment.tempId);
  };

  const handleCloseSheet = (open: boolean) => {
    if (!open && editingPaymentId) {
      // Remove empty payments when sheet closes without saving
      const editing = payments.find((p) => p.tempId === editingPaymentId);
      if (editing && (!editing.amount || editing.amount.trim() === "")) {
        onPaymentsChange(payments.filter((p) => p.tempId !== editingPaymentId));
      }
      setEditingPaymentId(null);
    }
  };

  const handleRemovePayment = (tempId: string) => {
    onPaymentsChange(payments.filter((p) => p.tempId !== tempId));
    if (editingPaymentId === tempId) setEditingPaymentId(null);
  };

  const handlePaymentChange = (
    tempId: string,
    field: keyof SalePaymentRow,
    value: string,
  ) => {
    onPaymentsChange(
      payments.map((p) => {
        if (p.tempId !== tempId) return p;
        const updated = { ...p, [field]: value };
        if (field === "method") {
          updated.accountId =
            getDefaultAccountForMethod(value as PaymentMethod, accounts) || "";
          if (value !== PaymentMethod.BANK_TRANSFER) {
            updated.attachmentUrl = "";
          }
        }
        return updated;
      }),
    );
  };

  const getPaymentMethodLabel = (method: PaymentMethod) =>
    getMethodLabel(method, t);

  // Short chip labels
  const getChipLabel = (method: PaymentMethod): string => {
    const labels: Partial<Record<PaymentMethod, string>> = {
      [PaymentMethod.CASH]: t("paymentCash"),
      [PaymentMethod.BANK_TRANSFER]: t("paymentBankTransfer"),
    };
    return labels[method] ?? method;
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("payments")}
        {payments.length > 0 && ` (${payments.length})`}
      </h3>

      {/* Quick-add method chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => addPayment(method)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 active:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            + {getChipLabel(method)}
          </button>
        ))}
      </div>

      {/* Payment list — ledger rows */}
      {payments.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          {payments.map((payment) => {
            const amount = parseFloat(payment.amount) || 0;
            return (
              <button
                key={payment.tempId}
                type="button"
                onClick={() => setEditingPaymentId(payment.tempId)}
                disabled={disabled}
                className="flex items-center gap-3 w-full px-3 py-3 border-b border-border/40 last:border-0 hover:bg-accent/50 active:bg-accent transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {getPaymentMethodLabel(payment.method)}
                  </p>
                  {payment.reference && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {payment.reference}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "font-mono text-sm font-medium tabular-nums shrink-0 w-24 text-right",
                    amount === 0 && "text-muted-foreground",
                  )}
                >
                  {amount > 0 ? formatCurrency(amount) : "—"}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Balance summary — ledger rows */}
      {total > 0 && (
        <div className="rounded-md border overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {t("totalSale")}
            </span>
            <span className="font-mono text-xs font-medium tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
          {totalPaid > 0 && (
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {t("totalPaid")}
              </span>
              <span className="font-mono text-xs font-medium tabular-nums">
                {formatCurrency(totalPaid)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-3">
            <span className="text-sm font-semibold">{t("balance")}</span>
            <span
              className={cn(
                "font-mono text-base font-bold tabular-nums",
                balance > 0
                  ? "text-warning"
                  : balance < 0
                    ? "text-destructive"
                    : "text-success",
              )}
            >
              {formatCurrency(balance)}
            </span>
          </div>
          {balance < 0 && (
            <div className="px-3 py-2 bg-destructive/5">
              <p className="text-xs text-destructive font-medium">
                {t("validation.paymentsExceedTotal")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit payment sheet */}
      <Sheet open={editingPaymentId !== null} onOpenChange={handleCloseSheet}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle>{t("paymentDetails")}</SheetTitle>
          </SheetHeader>

          {editingPayment && (
            <ScrollArea className="flex-1 mt-6">
              <div className="space-y-5 pb-8 px-1">
                {/* Payment method */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-method"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("paymentMethod")}
                  </Label>
                  <Select
                    value={editingPayment.method}
                    onValueChange={(value) =>
                      handlePaymentChange(editingPayment.tempId, "method", value)
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger id="payment-method" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.CASH}>
                        {t("paymentCash")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                        {t("paymentBankTransfer")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-amount"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("paymentAmount")} *
                  </Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPayment.amount}
                    onChange={(e) =>
                      handlePaymentChange(
                        editingPayment.tempId,
                        "amount",
                        e.target.value,
                      )
                    }
                    placeholder={t("paymentAmountPlaceholder")}
                    disabled={disabled}
                    className={cn(
                      "h-12 text-base font-mono tabular-nums",
                      !editingPayment.amount ||
                        editingPayment.amount.trim() === ""
                        ? "border-destructive"
                        : "",
                    )}
                  />
                  {(!editingPayment.amount ||
                    editingPayment.amount.trim() === "") && (
                    <p className="text-xs text-destructive">
                      {t("validation.paymentAmountRequired")}
                    </p>
                  )}
                </div>

                {/* Destination account */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-account"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("paymentDestinationAccount")}
                  </Label>
                  <Select
                    value={editingPayment.accountId || ""}
                    onValueChange={(value) =>
                      handlePaymentChange(
                        editingPayment.tempId,
                        "accountId",
                        value,
                      )
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger id="payment-account" className="h-12">
                      <SelectValue placeholder={t("selectAccount")} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <span>{account.name}</span>
                            {account.accountNumber && (
                              <span className="text-muted-foreground text-xs">
                                — {account.accountNumber}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-reference"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("paymentReference")}
                  </Label>
                  <Input
                    id="payment-reference"
                    value={editingPayment.reference || ""}
                    onChange={(e) =>
                      handlePaymentChange(
                        editingPayment.tempId,
                        "reference",
                        e.target.value,
                      )
                    }
                    placeholder={t("paymentReferencePlaceholder")}
                    disabled={disabled}
                    className="h-12 text-base"
                  />
                </div>

                {/* Attachment for transfers */}
                {editingPayment.method === PaymentMethod.BANK_TRANSFER && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("paymentAttachmentLabel")}
                    </Label>
                    <AttachmentUpload
                      currentUrl={editingPayment.attachmentUrl}
                      onUploadComplete={(url) =>
                        handlePaymentChange(
                          editingPayment.tempId,
                          "attachmentUrl",
                          url,
                        )
                      }
                      disabled={disabled}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      handleRemovePayment(editingPayment.tempId)
                    }
                    disabled={disabled}
                    aria-label={t("removePayment")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    className="h-12 flex-1"
                    onClick={() => setEditingPaymentId(null)}
                  >
                    {t("done")}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
