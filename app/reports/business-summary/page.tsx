"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Receipt,
  Wallet,
  Building2,
  Landmark,
  Banknote,
  Smartphone,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { BranchSelector } from "@/components/ui/branch-selector";
import { BusinessLineSelector } from "@/components/ui/business-line-selector";
import { useActiveBranch } from "@/hooks/use-active-branch";
import { useBusinessLines } from "@/hooks/use-business-lines";
import { ViewToggle } from "@/components/reports/view-toggle";
import { ExportButton } from "@/components/reports/export-button";
import { MetricCard } from "@/components/reports/metric-card";
import { LineChart } from "@/components/reports/charts/line-chart";
import { BarChart } from "@/components/reports/charts/bar-chart";
import { PieChart } from "@/components/reports/charts/pie-chart";
import {
  MetricDetailModal,
  createSalesDetailColumns,
  createExpensesDetailColumns,
} from "@/components/reports/metric-detail-modal";
import type { DateRange, ViewMode } from "@/lib/types/reports";
import { useQuery } from "@tanstack/react-query";
import { getBusinessSummaryEnhanced } from "@/apis/actions/reports";

export default function BusinessSummaryPage() {
  const t = useTranslations("Reports");
  const locale = useLocale();

  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [expensesModalOpen, setExpensesModalOpen] = useState(false);
  const { activeBranchId } = useActiveBranch();
  const { data: blData } = useBusinessLines({ activeOnly: true });
  const [branchId, setBranchId] = useState<string | null>(null);
  const [businessLineId, setBusinessLineId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (!activeBranchId) return;

    setBranchId(activeBranchId);

    const lines = blData?.businessLines;
    if (lines?.length === 1) {
      setBusinessLineId(lines[0].id);
    }

    setInitialized(true);
  }, [activeBranchId, blData, initialized]);

  const {
    data: reportData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "business-summary-enhanced",
      format(dateRange.start, "yyyy-MM-dd"),
      format(dateRange.end, "yyyy-MM-dd"),
      branchId,
      businessLineId,
    ],
    queryFn: async () => {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      const response = await getBusinessSummaryEnhanced({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        branchId: branchId || undefined,
        businessLineId: businessLineId || undefined,
      });
      if (!response.success) throw new Error(response.error);
      return response.data!;
    },
  });

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case "BANK": return <Landmark className="h-5 w-5 text-blue-500" />;
      case "CASH_REGISTER": return <Banknote className="h-5 w-5 text-green-500" />;
      case "DIGITAL_WALLET": return <Smartphone className="h-5 w-5 text-purple-500" />;
      default: return <Building2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          pageTitle={t("businessSummaryTitle")}
          pageDes={t("description")}
        />
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          pageTitle={t("businessSummaryTitle")}
          pageDes={t("description")}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : t("errorLoading")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        pageTitle={t("businessSummaryTitle")}
        pageDes={t("description")}
      />

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
                <div className="min-w-0 flex-1">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    locale={locale}
                  />
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div className="w-48 space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("filterByBranch")}
                    </label>
                    <BranchSelector
                      value={branchId}
                      onValueChange={setBranchId}
                      allowNone
                    />
                  </div>
                  <div className="w-48 space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("filterByBusinessLine")}
                    </label>
                    <BusinessLineSelector
                      value={businessLineId}
                      onValueChange={setBusinessLineId}
                      allowNone
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
            <ViewToggle view={viewMode} onChange={setViewMode} />
            <ExportButton
              type="business"
              data={reportData || null}
              dateRange={dateRange}
            />
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Main Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title={t("revenue")}
              value={formatCurrency(reportData.metrics.revenue.current.total)}
              subtitle={`${reportData.metrics.revenue.current.count} ventas • ${formatCurrency(reportData.metrics.revenue.current.average)} promedio`}
              icon={<TrendingUp />}
              trend={{
                value: reportData.metrics.revenue.change.total,
                isPositive: reportData.metrics.revenue.change.total >= 0,
              }}
              onClick={() => setSalesModalOpen(true)}
            />

            <MetricCard
              title={t("cogs")}
              value={formatCurrency(reportData.metrics.costs.current.total)}
              subtitle={`${t("grossProfit")}: ${formatCurrency(reportData.metrics.costs.current.grossProfit)} (${formatPercent(reportData.metrics.costs.current.grossMargin)})`}
              icon={<ShoppingCart />}
              trend={{
                value: reportData.metrics.costs.change.total,
                isPositive: reportData.metrics.costs.change.total <= 0, // Lower is better
              }}
            />

            <MetricCard
              title={t("expenses")}
              value={formatCurrency(reportData.metrics.expenses.current.total)}
              subtitle={`${reportData.metrics.expenses.current.byCategory.length} categorías`}
              icon={<Receipt />}
              trend={{
                value: reportData.metrics.expenses.change.total,
                isPositive: reportData.metrics.expenses.change.total <= 0, // Lower is better
              }}
              onClick={() => setExpensesModalOpen(true)}
            />

            <MetricCard
              title={t("netProfit")}
              value={formatCurrency(reportData.metrics.profit.current.net)}
              subtitle={`${t("netMargin")}: ${formatPercent(reportData.metrics.profit.current.netMargin)}`}
              icon={<DollarSign />}
              className={
                reportData.metrics.profit.current.net < 0
                  ? "border-red-200"
                  : "border-green-200"
              }
              trend={{
                value: reportData.metrics.profit.change.net,
                isPositive: reportData.metrics.profit.change.net >= 0,
              }}
            />
          </div>

          {/* Cash Flow */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5" />
                <h3 className="text-lg font-semibold">{t("cashFlow")}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("cashReceived")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.cashFlow.cashReceived)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("cashSpent")}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.cashFlow.cashSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("netCash")}
                  </p>
                  <p
                    className={`text-2xl font-bold ${reportData.cashFlow.netCash >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(reportData.cashFlow.netCash)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Breakdown */}
          {reportData.cashFlow.byAccount && reportData.cashFlow.byAccount.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">{t("accountBreakdown")}</h3>
                </div>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {reportData.cashFlow.byAccount.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex flex-col gap-1 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {getAccountIcon(account.accountType)}
                        <span className="text-sm font-medium text-muted-foreground truncate">
                          {account.accountName}
                        </span>
                      </div>
                      <span className="text-2xl font-bold">
                        {formatCurrency(account.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary View */}
          {viewMode === "summary" && (
            <div className="grid gap-4 md:grid-cols-2">
              <BarChart
                data={reportData.charts.topProducts.slice(0, 10)}
                title={t("topProducts")}
              />
              <PieChart
                data={reportData.charts.expensesByCategory}
                title={t("expenseDistribution")}
              />
            </div>
          )}

          {/* Detailed View */}
          {viewMode === "detailed" && (
            <>
              <LineChart
                data={reportData.charts.salesTrend}
                title={t("salesTrend")}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <BarChart
                  data={reportData.charts.topProducts}
                  title={`${t("topProducts")} (Top 20)`}
                  layout="vertical"
                />
                <BarChart
                  data={reportData.charts.topCustomers}
                  title={`${t("topCustomers")} (Top 20)`}
                  layout="vertical"
                />
              </div>

              <PieChart
                data={reportData.charts.expensesByCategory}
                title={t("expensesByCategory")}
              />
            </>
          )}

          {/* Modals */}
          <MetricDetailModal
            open={salesModalOpen}
            onOpenChange={setSalesModalOpen}
            title={t("salesDetail")}
            data={reportData.details.salesBreakdown}
            columns={createSalesDetailColumns(locale)}
            locale={locale}
          />

          <MetricDetailModal
            open={expensesModalOpen}
            onOpenChange={setExpensesModalOpen}
            title={t("expensesDetail")}
            data={reportData.details.expenseBreakdown}
            columns={createExpensesDetailColumns(locale)}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
