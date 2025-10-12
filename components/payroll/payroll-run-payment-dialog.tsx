"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PayrollRunWithDetails } from "@/lib/types/payroll";

interface PayrollRunPaymentDialogProps {
  run: PayrollRunWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payments: { userId: string; amount: string }[]) => Promise<void>;
  isLoading?: boolean;
}

export function PayrollRunPaymentDialog({
  run,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PayrollRunPaymentDialogProps) {
  const t = useTranslations("Payroll");
  
  // Estado para los montos de pago de cada empleado
  const [payments, setPayments] = useState<Record<string, string>>({});

  if (!run) return null;

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const handlePaymentChange = (userId: string, value: string) => {
    setPayments((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  const handlePayAll = () => {
    const newPayments: Record<string, string> = {};
    run.items?.forEach((item) => {
      if (parseFloat(item.balance) > 0) {
        newPayments[item.userId] = item.balance;
      }
    });
    setPayments(newPayments);
  };

  const handleSubmit = async () => {
    const paymentsArray = Object.entries(payments)
      .filter(([_, amount]) => amount && parseFloat(amount) > 0)
      .map(([userId, amount]) => ({ userId, amount }));

    if (paymentsArray.length === 0) {
      return;
    }

    await onSubmit(paymentsArray);
    setPayments({});
    onOpenChange(false);
  };

  const totalToPay = Object.values(payments).reduce(
    (sum, amount) => sum + (parseFloat(amount) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("payRun")}</DialogTitle>
          <DialogDescription>{t("payDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold">{run.periodLabel}</h3>
              <p className="text-xs text-muted-foreground">
                {run.items?.length || 0} empleados
              </p>
            </div>
            <Button type="button" variant="outline" onClick={handlePayAll}>
              Pagar todo el saldo
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("employee")}</TableHead>
                  <TableHead className="text-right">{t("payableTotal")}</TableHead>
                  <TableHead className="text-right">{t("paidAmount")}</TableHead>
                  <TableHead className="text-right">{t("balance")}</TableHead>
                  <TableHead className="text-right">Monto a Pagar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!run.items || run.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t("noItems")}
                    </TableCell>
                  </TableRow>
                ) : (
                  run.items.map((item) => {
                    const balance = parseFloat(item.balance);
                    const canPay = balance > 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.user?.name || "—"}
                            </span>
                            {item.user?.email && (
                              <span className="text-xs text-muted-foreground">
                                {item.user.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.payableTotal)}
                        </TableCell>
                        <TableCell className="text-right text-green-700 dark:text-green-400">
                          {formatCurrency(item.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(item.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {canPay ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={item.balance}
                              placeholder="0.00"
                              value={payments[item.userId] || ""}
                              onChange={(e) =>
                                handlePaymentChange(item.userId, e.target.value)
                              }
                              className="w-32 text-right"
                              disabled={isLoading}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Pagado
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalToPay > 0 && (
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total a Pagar</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(totalToPay)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPayments({});
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || totalToPay === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Pagos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

