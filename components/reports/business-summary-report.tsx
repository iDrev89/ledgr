"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Receipt,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "./metric-card";
import { useBusinessSummary } from "@/hooks/use-reports";
import type { DateRange } from "@/lib/types/reports";

interface BusinessSummaryReportProps {
  dateRange: DateRange;
  locale?: string;
}

export function BusinessSummaryReport({
  dateRange,
  locale = "es",
}: BusinessSummaryReportProps) {
  const t = useTranslations("Reports");

  // Calculate start and end of day in local timezone
  const startDate = new Date(dateRange.start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateRange.end);
  endDate.setHours(23, 59, 59, 999);

  const { data, isLoading, error } = useBusinessSummary({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : t("errorLoading")}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("noData")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <MetricCard
          title={t("revenue")}
          value={formatCurrency(data.revenue.total)}
          subtitle={`${data.revenue.count} ${t("salesCount").toLowerCase()} • ${formatCurrency(data.revenue.average)} ${t("averageTicket").toLowerCase()}`}
          icon={<TrendingUp />}
        />

        {/* Costs */}
        <MetricCard
          title={t("cogs")}
          value={formatCurrency(data.costs.total)}
          subtitle={`${t("grossProfit")}: ${formatCurrency(data.costs.grossProfit)} (${formatPercent(data.costs.grossMargin)})`}
          icon={<ShoppingCart />}
        />

        {/* Expenses */}
        <MetricCard
          title={t("expenses")}
          value={formatCurrency(data.expenses.total)}
          subtitle={`${data.expenses.byCategory.length} ${t("category").toLowerCase()}${data.expenses.byCategory.length !== 1 ? "s" : ""}`}
          icon={<Receipt />}
        />

        {/* Profit */}
        <MetricCard
          title={t("netProfit")}
          value={formatCurrency(data.profit.net)}
          subtitle={`${t("netMargin")}: ${formatPercent(data.profit.netMargin)}`}
          icon={<DollarSign />}
          className={
            data.profit.net < 0 ? "border-red-200" : "border-green-200"
          }
        />
      </div>

      {/* Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("cashFlow")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("cashReceived")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.cashFlow.cashReceived)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("cashSpent")}</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(data.cashFlow.cashSpent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("netCash")}</p>
              <p
                className={`text-2xl font-bold ${data.cashFlow.netCash >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(data.cashFlow.netCash)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>{t("topProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("noData")}
              </div>
            ) : (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantitySold} {t("unitsSold")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>{t("expensesByCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.expenses.byCategory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("noData")}
              </div>
            ) : (
              <div className="space-y-4">
                {data.expenses.byCategory.map((category) => (
                  <div
                    key={category.categoryId || "uncategorized"}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {category.categoryName}
                      </span>
                      <span className="text-sm font-bold">
                        {formatCurrency(category.total)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {formatPercent(category.percentage)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline - Sales vs Expenses */}
      {data.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("salesTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.timeline.map((point) => (
                <div
                  key={point.date}
                  className="grid grid-cols-[100px_1fr_1fr] gap-4 items-center"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {point.date}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((point.sales / Math.max(...data.timeline.map((p) => Math.max(p.sales, p.expenses)))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium whitespace-nowrap">
                        {formatCurrency(point.sales)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((point.expenses / Math.max(...data.timeline.map((p) => Math.max(p.sales, p.expenses)))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium whitespace-nowrap">
                        {formatCurrency(point.expenses)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-sm">{t("revenue")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-sm">{t("expenses")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
