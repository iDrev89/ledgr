"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export type SalePaymentRow = SalePaymentInput & {
  tempId: string;
};

interface SalePaymentsProps {
  payments: SalePaymentRow[];
  onPaymentsChange: (payments: SalePaymentRow[]) => void;
  total: number;
  disabled?: boolean;
}

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

  const handleAddPayment = () => {
    const newPayment: SalePaymentRow = {
      tempId: `temp-${Date.now()}`,
      amount: "",
      method: PaymentMethod.CASH,
      accountId: getDefaultAccountForMethod(PaymentMethod.CASH, accounts) || "",
      reference: "",
      attachmentUrl: "",
    };
    onPaymentsChange([...payments, newPayment]);
    setEditingPaymentId(newPayment.tempId);
  };

  const handleCloseSheet = (open: boolean) => {
    if (!open && editingPaymentId) {
      // Si se cierra el sheet sin haber agregado un monto, eliminar el pago vacío
      const editingPayment = payments.find(
        (p) => p.tempId === editingPaymentId,
      );
      if (
        editingPayment &&
        (!editingPayment.amount || editingPayment.amount.trim() === "")
      ) {
        handleRemovePayment(editingPaymentId);
      }
      setEditingPaymentId(null);
    }
  };

  const handleRemovePayment = (tempId: string) => {
    onPaymentsChange(payments.filter((p) => p.tempId !== tempId));
    if (editingPaymentId === tempId) {
      setEditingPaymentId(null);
    }
  };

  const handlePaymentChange = (
    tempId: string,
    field: keyof SalePaymentRow,
    value: string,
  ) => {
    onPaymentsChange(
      payments.map((p) => {
        if (p.tempId === tempId) {
          const updated = { ...p, [field]: value };
          if (field === "method") {
            updated.accountId =
              getDefaultAccountForMethod(value as PaymentMethod, accounts) || "";
            if (
              value !== PaymentMethod.BANK_TRANSFER &&
              value !== PaymentMethod.DIGITAL_PAYMENT
            ) {
              updated.attachmentUrl = "";
            }
          }
          return updated;
        }
        return p;
      }),
    );
  };

  const getPaymentMethodLabelLocal = (method: PaymentMethod) =>
    getMethodLabel(method, t);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalPaid = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const balance = total - totalPaid;
  const editingPayment = payments.find((p) => p.tempId === editingPaymentId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold">
            {t("payments")} ({payments.length})
          </h3>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddPayment}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addPayment")}
        </Button>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("tapAddPaymentToStart")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {payments.map((payment, index) => {
            const amount = parseFloat(payment.amount) || 0;
            const hasAttachment =
              payment.method === PaymentMethod.BANK_TRANSFER ||
              payment.method === PaymentMethod.DIGITAL_PAYMENT;

            return (
              <Card
                key={payment.tempId}
                className="cursor-pointer hover:bg-accent/50 transition-all border-2 hover:border-primary/50 shadow-sm hover:shadow-md"
                onClick={() => setEditingPaymentId(payment.tempId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {getPaymentMethodLabelLocal(payment.method)}
                        </Badge>
                        {hasAttachment && payment.attachmentUrl && (
                          <Badge variant="outline" className="text-xs">
                            📎
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pago #{index + 1}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-muted-foreground truncate">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {amount > 0 ? formatCurrency(amount) : "-"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <Card
        className={`border-2 shadow-md ${
          balance > 0
            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            : balance < 0
              ? "bg-destructive/5 border-destructive/20"
              : "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
        }`}
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              {t("totalSale")}
            </span>
            <span className="font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              {t("totalPaid")}
            </span>
            <span className="font-semibold">{formatCurrency(totalPaid)}</span>
          </div>
          <Separator
            className={
              balance > 0
                ? "bg-amber-200 dark:bg-amber-800"
                : balance < 0
                  ? "bg-destructive/20"
                  : "bg-green-200 dark:bg-green-800"
            }
          />
          <div className="flex justify-between pt-1">
            <span className="text-base font-bold">{t("balance")}</span>
            <span
              className={`text-2xl font-bold ${
                balance > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : balance < 0
                    ? "text-destructive"
                    : "text-green-600 dark:text-green-400"
              }`}
            >
              {formatCurrency(balance)}
            </span>
          </div>
          {balance < 0 && (
            <p className="text-xs text-destructive pt-2 font-medium">
              {t("validation.paymentsExceedTotal")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Payment Sheet */}
      <Sheet open={editingPaymentId !== null} onOpenChange={handleCloseSheet}>
        <SheetContent side="bottom" className="h-[85vh] px-6 sm:px-8">
          <SheetHeader>
            <SheetTitle>{t("paymentDetails")}</SheetTitle>
            <SheetDescription>{t("editPaymentDescription")}</SheetDescription>
          </SheetHeader>

          {editingPayment && (
            <ScrollArea className="h-[calc(85vh-140px)] mt-6">
              <div className="space-y-4 pb-6 px-1">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-method"
                    className="text-sm font-medium"
                  >
                    {t("paymentMethod")}
                  </Label>
                  <Select
                    value={editingPayment.method}
                    onValueChange={(value) =>
                      handlePaymentChange(
                        editingPayment.tempId,
                        "method",
                        value,
                      )
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
                      <SelectItem value={PaymentMethod.DEBIT_CARD}>
                        {t("paymentDebitCard")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CREDIT_CARD}>
                        {t("paymentCreditCard")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                        {t("paymentBankTransfer")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.DIGITAL_PAYMENT}>
                        {t("paymentDigitalPayment")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CHECK}>
                        {t("paymentCheck")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.OTHER}>
                        {t("paymentOther")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-amount"
                    className="text-sm font-medium"
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
                    required
                    className={`h-12 text-base ${
                      !editingPayment.amount ||
                      editingPayment.amount.trim() === ""
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  {(!editingPayment.amount ||
                    editingPayment.amount.trim() === "") && (
                    <p className="text-xs text-destructive">
                      {t("validation.paymentAmountRequired")}
                    </p>
                  )}
                </div>

                {/* Destination Account */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-account"
                    className="text-sm font-medium"
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
                              <span className="text-muted-foreground">
                                - {account.accountNumber}
                              </span>
                            )}
                            <Badge variant="outline" className="text-[10px] ml-1">
                              {getAccountTypeLabel(account.type, tAccounts)}
                            </Badge>
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
                    className="text-sm font-medium"
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

                {/* Attachment (for transfers and digital payments) */}
                {(editingPayment.method === PaymentMethod.BANK_TRANSFER ||
                  editingPayment.method === PaymentMethod.DIGITAL_PAYMENT) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
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
                <div className="pt-4 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => setEditingPaymentId(null)}
                  >
                    {t("done")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full h-12"
                    onClick={() => handleRemovePayment(editingPayment.tempId)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("removePayment")}
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
