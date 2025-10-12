"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PayrollRunWithDetails } from "@/lib/types/payroll";
import { PayrollRunStatus } from "@/prisma/prisma-client";

interface PayrollRunDetailDialogProps {
  run: PayrollRunWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollRunDetailDialog({
  run,
  open,
  onOpenChange,
}: PayrollRunDetailDialogProps) {
  const t = useTranslations("Payroll");

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

  const getStatusVariant = (status: PayrollRunStatus) => {
    const variants = {
      [PayrollRunStatus.DRAFT]: "secondary",
      [PayrollRunStatus.FINALIZED]: "default",
      [PayrollRunStatus.PAID]: "outline",
    } as const;
    return variants[status];
  };

  const getStatusLabel = (status: PayrollRunStatus) => {
    const labels = {
      [PayrollRunStatus.DRAFT]: t("statusDraft"),
      [PayrollRunStatus.FINALIZED]: t("statusFinalized"),
      [PayrollRunStatus.PAID]: t("statusPaid"),
    };
    return labels[status];
  };

  const totalCommissions = run.items?.reduce(
    (sum, item) => sum + parseFloat(item.commissionsTotal),
    0
  ) || 0;
  const totalPayable = run.items?.reduce(
    (sum, item) => sum + parseFloat(item.payableTotal),
    0
  ) || 0;
  const totalPaid = run.items?.reduce(
    (sum, item) => sum + parseFloat(item.paidAmount),
    0
  ) || 0;
  const totalBalance = run.items?.reduce(
    (sum, item) => sum + parseFloat(item.balance),
    0
  ) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{run.periodLabel}</DialogTitle>
          <DialogDescription>
            {format(new Date(run.startDate), "dd MMMM", { locale: es })} -{" "}
            {format(new Date(run.endDate), "dd MMMM yyyy", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Period Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("status")}</h3>
              <Badge variant={getStatusVariant(run.status)}>
                {getStatusLabel(run.status)}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">{t("periodType")}</h3>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">
                  {run.periodType === "DAILY"
                    ? t("periodTypeDaily")
                    : run.periodType === "BIWEEKLY"
                    ? t("periodTypeBiweekly")
                    : t("periodTypeCustom")}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary Totals */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("summary")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("commissionsTotal")}
                </p>
                <p className="text-lg font-bold">{formatCurrency(totalCommissions)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("payableTotal")}
                </p>
                <p className="text-lg font-bold">{formatCurrency(totalPayable)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("paidAmount")}
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">{t("balance")}</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employee Items Table */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("employees")}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("employee")}</TableHead>
                    <TableHead className="text-right">
                      {t("commissionsTotal")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("advancesTotal")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("adjustmentsTotal")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("payableTotal")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("paidAmount")}
                    </TableHead>
                    <TableHead className="text-right">{t("balance")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!run.items || run.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {t("noItems")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    run.items.map((item) => (
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
                        <TableCell className="text-right">
                          {formatCurrency(item.commissionsTotal)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {parseFloat(item.advancesTotal) > 0
                            ? `-${formatCurrency(item.advancesTotal)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(item.adjustmentsTotal) !== 0
                            ? formatCurrency(item.adjustmentsTotal)
                            : "-"}
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals Summary at Bottom */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("commissionsTotal")}
                </span>
                <span className="font-medium">{formatCurrency(totalCommissions)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payableTotal")}</span>
                <span className="font-medium">{formatCurrency(totalPayable)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("paidAmount")}</span>
                <span className="font-medium text-green-700 dark:text-green-400">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">{t("balance")}</span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

