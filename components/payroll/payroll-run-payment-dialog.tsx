"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    setPayments((prev) => ({ ...prev, [userId]: value }));
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

    if (paymentsArray.length === 0) return;

    await onSubmit(paymentsArray);
    setPayments({});
    onOpenChange(false);
  };

  const totalToPay = Object.values(payments).reduce(
    (sum, amount) => sum + (parseFloat(amount) || 0),
    0,
  );

  const pendingItems =
    run.items?.filter((item) => parseFloat(item.balance) > 0) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("payRun")}</DialogTitle>
            <DialogDescription>
              {run.periodLabel} · {run.items?.length || 0} {t("employees")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <div className="pb-4 space-y-4 pt-4">
            {/* Pay-all action */}
            {pendingItems.length > 0 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePayAll}
                  disabled={isLoading}
                >
                  {t("payDescription")}
                </Button>
              </div>
            )}

            {/* Mobile: employee cards */}
            <div className="space-y-2 md:hidden">
              {!run.items || run.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("noItems")}
                </p>
              ) : (
                run.items.map((item) => {
                  const balance = parseFloat(item.balance);
                  const canPay = balance > 0;

                  return (
                    <div key={item.id} className="rounded-md border overflow-hidden">
                      <div className="px-3 py-2.5 border-b border-border/60">
                        <p className="font-medium text-sm">
                          {item.user?.name || "—"}
                        </p>
                        {item.user?.email && (
                          <p className="text-xs text-muted-foreground">
                            {item.user.email}
                          </p>
                        )}
                      </div>
                      <div className="divide-y divide-border/40 px-3 py-1">
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-xs text-muted-foreground">
                            {t("payableTotal")}
                          </span>
                          <span className="font-mono text-sm tabular-nums font-medium">
                            {formatCurrency(item.payableTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-xs text-muted-foreground">
                            {t("paidAmount")}
                          </span>
                          <span className="font-mono text-sm tabular-nums text-success">
                            {formatCurrency(item.paidAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {t("balance")}
                          </span>
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${balance > 0 ? "text-warning" : "text-success"}`}
                          >
                            {formatCurrency(balance)}
                          </span>
                        </div>
                        {canPay && (
                          <div className="flex justify-between items-center py-2 gap-3">
                            <span className="text-xs text-muted-foreground shrink-0">
                              {t("amount")}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={item.balance}
                              placeholder="0"
                              value={payments[item.userId] || ""}
                              onChange={(e) =>
                                handlePaymentChange(item.userId, e.target.value)
                              }
                              className="text-right font-mono tabular-nums"
                              disabled={isLoading}
                            />
                          </div>
                        )}
                        {!canPay && (
                          <div className="py-2">
                            <span className="text-xs text-success font-medium">
                              ✓ {t("statusPaid")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("employee")}</TableHead>
                    <TableHead className="text-right">
                      {t("payableTotal")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("paidAmount")}
                    </TableHead>
                    <TableHead className="text-right">{t("balance")}</TableHead>
                    <TableHead className="text-right">{t("amount")}</TableHead>
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
                          <TableCell className="text-right font-mono tabular-nums font-medium">
                            {formatCurrency(item.payableTotal)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums text-success">
                            {formatCurrency(item.paidAmount)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono tabular-nums font-bold ${balance > 0 ? "text-warning" : "text-success"}`}
                          >
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell className="text-right">
                            {canPay ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={item.balance}
                                placeholder="0"
                                value={payments[item.userId] || ""}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    item.userId,
                                    e.target.value,
                                  )
                                }
                                className="w-32 text-right font-mono tabular-nums"
                                disabled={isLoading}
                              />
                            ) : (
                              <span className="text-xs text-success font-medium">
                                ✓ {t("statusPaid")}
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
          </div>
        </ScrollArea>

        {/* Footer with total + actions */}
        <div className="px-6 pb-6 pt-3 border-t border-border space-y-3">
          {totalToPay > 0 && (
            <div className="rounded-md border overflow-hidden divide-y divide-border">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-sm text-muted-foreground">
                  {t("payableTotal")}
                </span>
                <span className="font-mono tabular-nums font-bold text-base">
                  {formatCurrency(totalToPay)}
                </span>
              </div>
            </div>
          )}
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
              {t("pay")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
