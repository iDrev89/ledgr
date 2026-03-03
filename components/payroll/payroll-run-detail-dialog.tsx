"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, Fragment } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  if (!run) return null;

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

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

  const getPeriodTypeLabel = (type: string) => {
    if (type === "DAILY") return t("periodTypeDaily");
    if (type === "BIWEEKLY") return t("periodTypeBiweekly");
    return t("periodTypeCustom");
  };

  const totalCommissions =
    run.items?.reduce(
      (sum, item) => sum + parseFloat(item.commissionsTotal),
      0,
    ) || 0;
  const totalPayable =
    run.items?.reduce((sum, item) => sum + parseFloat(item.payableTotal), 0) ||
    0;
  const totalPaid =
    run.items?.reduce((sum, item) => sum + parseFloat(item.paidAmount), 0) || 0;
  const totalBalance =
    run.items?.reduce((sum, item) => sum + parseFloat(item.balance), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{run.periodLabel}</DialogTitle>
          <DialogDescription>
            {format(new Date(run.startDate), "dd MMMM", { locale: es })} —{" "}
            {format(new Date(run.endDate), "dd MMMM yyyy", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Meta info — Ledger Row */}
          <div className="rounded-md border px-3 py-1">
            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("status")}
              </span>
              <Badge variant={getStatusVariant(run.status)}>
                {getStatusLabel(run.status)}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("periodType")}
              </span>
              <span className="text-sm font-medium">
                {getPeriodTypeLabel(run.periodType)}
              </span>
            </div>
          </div>

          {/* Summary — Ledger Panel */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t("summary")}
            </p>
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-border lg:divide-y-0 lg:divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("commissionsTotal")}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                      {formatCurrency(totalCommissions)}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("payableTotal")}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                      {formatCurrency(totalPayable)}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("paidAmount")}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-success">
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("balance")}
                    </p>
                    <p
                      className={`mt-1 font-mono text-lg font-semibold tabular-nums ${totalBalance > 0 ? "text-warning" : "text-success"}`}
                    >
                      {formatCurrency(totalBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee breakdown */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t("employees")}
            </p>

            {!run.items || run.items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t("noItems")}
              </p>
            ) : (
              <>
                {/* Mobile: cards */}
                <div className="space-y-2 md:hidden">
                  {run.items.map((item) => {
                    const hasServices =
                      item.servicesSummary && item.servicesSummary.length > 0;
                    const isExpanded = expandedUsers.has(item.userId);
                    const balance = parseFloat(item.balance);

                    return (
                      <div
                        key={item.id}
                        className="rounded-md border overflow-hidden"
                      >
                        {/* Employee header */}
                        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                          <div>
                            <p className="font-medium text-sm">
                              {item.user?.name || "—"}
                            </p>
                            {item.user?.email && (
                              <p className="text-xs text-muted-foreground">
                                {item.user.email}
                              </p>
                            )}
                          </div>
                          {hasServices && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 shrink-0"
                              onClick={() => toggleUserExpanded(item.userId)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Financial rows */}
                        <div className="divide-y divide-border/40 px-3 py-1">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-xs text-muted-foreground">
                              {t("commissionsTotal")}
                            </span>
                            <span className="font-mono text-sm tabular-nums">
                              {formatCurrency(item.commissionsTotal)}
                            </span>
                          </div>
                          {parseFloat(item.advancesTotal) > 0 && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="text-xs text-muted-foreground">
                                {t("advancesTotal")}
                              </span>
                              <span className="font-mono text-sm tabular-nums text-destructive">
                                -{formatCurrency(item.advancesTotal)}
                              </span>
                            </div>
                          )}
                          {parseFloat(item.adjustmentsTotal) !== 0 && (
                            <div className="flex justify-between items-center py-1.5">
                              <span className="text-xs text-muted-foreground">
                                {t("adjustmentsTotal")}
                              </span>
                              <span className="font-mono text-sm tabular-nums">
                                {formatCurrency(item.adjustmentsTotal)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-xs text-muted-foreground">
                              {t("payableTotal")}
                            </span>
                            <span className="font-mono text-sm font-semibold tabular-nums">
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
                        </div>

                        {/* Expandable services */}
                        {hasServices && isExpanded && (
                          <div className="border-t border-border/60 px-3 py-3 bg-muted/30">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              {t("servicesPerformed")}
                            </p>
                            <div className="space-y-1.5">
                              {item.servicesSummary!.map((service, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <div>
                                    <span className="font-medium">
                                      {service.productName}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1.5">
                                      ×{service.quantity}
                                    </span>
                                  </div>
                                  <span className="font-mono tabular-nums text-sm">
                                    {formatCurrency(service.total)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block rounded-md border">
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
                        <TableHead className="text-right">
                          {t("balance")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {run.items.map((item) => {
                        const hasServices =
                          item.servicesSummary &&
                          item.servicesSummary.length > 0;
                        const isExpanded = expandedUsers.has(item.userId);
                        const balance = parseFloat(item.balance);

                        return (
                          <Fragment key={item.id}>
                            <TableRow>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {hasServices && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() =>
                                        toggleUserExpanded(item.userId)
                                      }
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
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
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono tabular-nums">
                                {formatCurrency(item.commissionsTotal)}
                              </TableCell>
                              <TableCell className="text-right font-mono tabular-nums text-destructive">
                                {parseFloat(item.advancesTotal) > 0
                                  ? `-${formatCurrency(item.advancesTotal)}`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono tabular-nums">
                                {parseFloat(item.adjustmentsTotal) !== 0
                                  ? formatCurrency(item.adjustmentsTotal)
                                  : "—"}
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
                            </TableRow>
                            {hasServices && isExpanded && (
                              <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableCell colSpan={7} className="py-3">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    {t("servicesPerformed")}
                                  </p>
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {item.servicesSummary!.map(
                                      (service, idx) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-center bg-background rounded-md px-3 py-2 border"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                              {service.productName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {t("quantity")}: {service.quantity}
                                            </p>
                                          </div>
                                          <p className="font-mono tabular-nums text-sm font-semibold ml-2">
                                            {formatCurrency(service.total)}
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>

          {/* Footer totals — Ledger Row */}
          <div className="rounded-md border overflow-hidden divide-y divide-border">
            <div className="flex justify-between items-center text-sm px-3 py-2">
              <span className="text-muted-foreground">
                {t("commissionsTotal")}
              </span>
              <span className="font-mono tabular-nums font-medium">
                {formatCurrency(totalCommissions)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm px-3 py-2">
              <span className="text-muted-foreground">{t("payableTotal")}</span>
              <span className="font-mono tabular-nums font-medium">
                {formatCurrency(totalPayable)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm px-3 py-2">
              <span className="text-muted-foreground">{t("paidAmount")}</span>
              <span className="font-mono tabular-nums font-medium text-success">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex justify-between items-center px-3 py-2">
              <span className="font-semibold text-sm">{t("balance")}</span>
              <span
                className={`font-mono tabular-nums text-base font-bold ${totalBalance > 0 ? "text-warning" : "text-success"}`}
              >
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
