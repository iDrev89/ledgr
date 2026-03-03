"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionTurnSummary } from "@/hooks/use-cash-session";

const CURRENCY_FORMAT = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type CashSessionSummaryProps = {
  sessionId: string;
};

export const CashSessionSummary = ({ sessionId }: CashSessionSummaryProps) => {
  const t = useTranslations("CashRegister");
  const { data, isLoading } = useSessionTurnSummary(sessionId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-border lg:divide-y-0 lg:divide-x divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const incomeFormatted = CURRENCY_FORMAT.format(Number(data.incomeTotal));
  const expensesFormatted = CURRENCY_FORMAT.format(Number(data.expenseTotal));
  const expectedFormatted = CURRENCY_FORMAT.format(
    Number(data.expectedBalance),
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-border lg:divide-y-0 lg:divide-x divide-border">
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("turnIncome")}
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-success">
              {incomeFormatted}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("turnExpenses")}
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-destructive">
              {expensesFormatted}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("turnExpectedBalance")}
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-foreground">
              {expectedFormatted}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("turnTransactions")}
            </p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
              {String(data.transactionCount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
