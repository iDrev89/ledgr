"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethod } from "@/prisma/prisma-client";
import { useBanks } from "@/hooks/use-banks";
import type { SalePaymentInput } from "@/lib/validations/sales";

export type SalePaymentRow = SalePaymentInput & {
  tempId: string;
};

interface SalePaymentsTableProps {
  payments: SalePaymentRow[];
  onPaymentsChange: (payments: SalePaymentRow[]) => void;
  total: number;
  disabled?: boolean;
}

export function SalePaymentsTable({
  payments,
  onPaymentsChange,
  total,
  disabled,
}: SalePaymentsTableProps) {
  const t = useTranslations("Sales");
  const { data: banksData } = useBanks({ activeOnly: true });
  const banks = banksData?.banks || [];

  const handleAddPayment = () => {
    const newPayment: SalePaymentRow = {
      tempId: `temp-${Date.now()}`,
      amount: "",
      method: PaymentMethod.CASH,
      bankId: "",
      reference: "",
    };
    onPaymentsChange([...payments, newPayment]);
  };

  const handleRemovePayment = (tempId: string) => {
    onPaymentsChange(payments.filter((p) => p.tempId !== tempId));
  };

  const handlePaymentChange = (
    tempId: string,
    field: keyof SalePaymentInput,
    value: string
  ) => {
    onPaymentsChange(
      payments.map((p) => {
        if (p.tempId === tempId) {
          const updated = { ...p, [field]: value };
          // Clear bank if method is not TRANSFER
          if (field === "method" && value !== PaymentMethod.TRANSFER) {
            updated.bankId = "";
          }
          return updated;
        }
        return p;
      })
    );
  };

  const totalPaid = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const balance = total - totalPaid;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("payments")}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPayment}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addPayment")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("noPayments")}</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">{t("paymentMethod")}</TableHead>
                    <TableHead className="w-[120px]">{t("paymentAmount")}</TableHead>
                    <TableHead>{t("paymentBank")}</TableHead>
                    <TableHead>{t("paymentReference")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.tempId}>
                      <TableCell>
                        <Select
                          value={payment.method}
                          onValueChange={(value) =>
                            handlePaymentChange(payment.tempId, "method", value)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PaymentMethod.CASH}>
                              {t("paymentCash")}
                            </SelectItem>
                            <SelectItem value={PaymentMethod.CARD}>
                              {t("paymentCard")}
                            </SelectItem>
                            <SelectItem value={PaymentMethod.TRANSFER}>
                              {t("paymentTransfer")}
                            </SelectItem>
                            <SelectItem value={PaymentMethod.DIGITAL}>
                              {t("paymentDigital")}
                            </SelectItem>
                            <SelectItem value={PaymentMethod.OTHER}>
                              {t("paymentOther")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={payment.amount}
                          onChange={(e) =>
                            handlePaymentChange(payment.tempId, "amount", e.target.value)
                          }
                          placeholder={t("paymentAmountPlaceholder")}
                          disabled={disabled}
                          required
                          className={
                            !payment.amount || payment.amount.trim() === ""
                              ? "border-destructive"
                              : ""
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {payment.method === PaymentMethod.TRANSFER ? (
                          <Select
                            value={payment.bankId || ""}
                            onValueChange={(value) =>
                              handlePaymentChange(payment.tempId, "bankId", value)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectBank")} />
                            </SelectTrigger>
                            <SelectContent>
                              {banks.map((bank) => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  {bank.name}
                                  {bank.accountNo && ` - ${bank.accountNo}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={payment.reference || ""}
                          onChange={(e) =>
                            handlePaymentChange(payment.tempId, "reference", e.target.value)
                          }
                          placeholder={t("paymentReferencePlaceholder")}
                          disabled={disabled}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePayment(payment.tempId)}
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Payment Summary */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t("totalPaid")}:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(totalPaid)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t("balance")}:</span>
                <span
                  className={`font-semibold ${
                    balance > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : balance < 0
                      ? "text-destructive"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(balance)}
                </span>
              </div>
              {balance < 0 && (
                <p className="text-xs text-destructive">
                  {t("validation.paymentsExceedTotal")}
                </p>
              )}
              {payments.some((p) => !p.amount || p.amount.trim() === "") && (
                <p className="text-xs text-destructive mt-2">
                  {t("validation.paymentAmountRequired")}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

