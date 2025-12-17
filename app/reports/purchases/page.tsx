"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Package,
  DollarSign,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ViewToggle } from "@/components/reports/view-toggle";
import { ExportButton } from "@/components/reports/export-button";
import { MetricCard } from "@/components/reports/metric-card";
import { ExpandableTable } from "@/components/reports/expandable-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import type {
  DateRange,
  ViewMode,
  PurchaseReportItemDetailed,
} from "@/lib/types/reports";
import type { PurchaseStatus } from "@/prisma/prisma-client";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getPurchaseReportEnhanced } from "@/apis/actions/reports";

export default function PurchasesReportPage() {
  const t = useTranslations("Reports");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [viewMode, setViewMode] = useState<ViewMode>("summary");

  const {
    data: reportData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["purchase-report-enhanced", dateRange],
    queryFn: async () => {
      const response = await getPurchaseReportEnhanced({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      if (!response.success) throw new Error(response.error);
      return response.data!;
    },
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    const variants: Record<
      PurchaseStatus,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      DRAFT: { label: t("statusDraft"), variant: "secondary" },
      APPROVED: { label: t("statusApproved"), variant: "default" },
      RECEIVED: { label: t("statusReceived"), variant: "default" },
      CLOSED: { label: t("statusClosed"), variant: "outline" },
      CANCELED: { label: t("statusCanceled"), variant: "destructive" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const summaryColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: t("purchaseDate"),
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), "PPP", {
            locale: dateLocale,
          }),
      },
      {
        accessorKey: "invoiceNo",
        header: t("invoiceNo"),
        cell: ({ row }) => row.original.invoiceNo || "-",
      },
      {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "total",
        header: t("total"),
        cell: ({ row }) => formatCurrency(row.original.total.toString()),
      },
      {
        accessorKey: "balance",
        header: t("balance"),
        cell: ({ row }) => {
          const balance = parseFloat(row.original.balance.toString());
          return (
            <span className={balance > 0 ? "text-amber-600 font-medium" : ""}>
              {formatCurrency(balance)}
            </span>
          );
        },
      },
    ],
    [t, dateLocale],
  );

  const detailedColumns = useMemo(
    () => [
      {
        header: t("purchaseDate"),
        accessor: (item: PurchaseReportItemDetailed) =>
          format(new Date(item.createdAt), "PPP", { locale: dateLocale }),
      },
      {
        header: t("invoiceNo"),
        accessor: (item: PurchaseReportItemDetailed) => item.invoiceNo || "-",
      },
      {
        header: t("supplier"),
        accessor: (item: PurchaseReportItemDetailed) =>
          item.supplier?.name || "-",
      },
      {
        header: t("status"),
        accessor: (item: PurchaseReportItemDetailed) =>
          getStatusBadge(item.status),
      },
      {
        header: t("total"),
        accessor: (item: PurchaseReportItemDetailed) =>
          formatCurrency(item.total.toString()),
        className: "text-right",
      },
      {
        header: t("balance"),
        accessor: (item: PurchaseReportItemDetailed) => {
          const balance = parseFloat(item.balance.toString());
          return (
            <span className={balance > 0 ? "text-amber-600 font-medium" : ""}>
              {formatCurrency(balance)}
            </span>
          );
        },
        className: "text-right",
      },
    ],
    [t, dateLocale],
  );

  const renderExpandedContent = (item: PurchaseReportItemDetailed) => (
    <div className="space-y-4">
      {/* Items */}
      {item.items.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">{t("items")}</h4>
          <div className="grid gap-2">
            {item.items.map((pItem) => (
              <div
                key={pItem.id}
                className="flex justify-between items-center text-sm bg-background p-2 rounded"
              >
                <span>{pItem.productName}</span>
                <span className="text-muted-foreground">
                  {pItem.quantity} x {formatCurrency(pItem.unitCost.toString())}{" "}
                  = {formatCurrency(pItem.lineTotal.toString())}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {item.payments.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">{t("paid")}</h4>
          <div className="grid gap-2">
            {item.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center text-sm bg-background p-2 rounded"
              >
                <div>
                  <span className="font-medium">
                    {formatCurrency(payment.amount.toString())}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    (
                    {format(new Date(payment.paidAt), "PPP", {
                      locale: dateLocale,
                    })}
                    )
                  </span>
                </div>
                <Badge variant="outline">{payment.method}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          pageTitle={t("purchasesTitle")}
          pageDes={t("description")}
        />
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
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
          pageTitle={t("purchasesTitle")}
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
      <PageHeader pageTitle={t("purchasesTitle")} pageDes={t("description")} />

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              locale={locale}
            />
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <ViewToggle view={viewMode} onChange={setViewMode} />
          <ExportButton
            type="purchases"
            data={reportData || null}
            dateRange={dateRange}
          />
        </div>
      </div>

      {reportData && (
        <>
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title={t("totalPurchases")}
              value={formatCurrency(reportData.metrics.current.totalPurchases)}
              icon={<ShoppingCart />}
              trend={{
                value: reportData.metrics.change.totalPurchases,
                isPositive: reportData.metrics.change.totalPurchases >= 0,
              }}
            />
            <MetricCard
              title={t("totalPaid")}
              value={formatCurrency(reportData.metrics.current.totalPaid)}
              icon={<DollarSign />}
              trend={{
                value: reportData.metrics.change.totalPaid,
                isPositive: reportData.metrics.change.totalPaid >= 0,
              }}
            />
            <MetricCard
              title={t("pendingBalance")}
              value={formatCurrency(reportData.metrics.current.balance)}
              icon={<Receipt />}
              className={
                reportData.metrics.current.balance > 0 ? "border-amber-200" : ""
              }
              trend={{
                value: reportData.metrics.change.balance,
                isPositive: reportData.metrics.change.balance <= 0, // Less balance is positive
              }}
            />
            <MetricCard
              title={t("purchaseCount")}
              value={reportData.metrics.current.count}
              icon={<Package />}
              trend={{
                value: reportData.metrics.change.count,
                isPositive: reportData.metrics.change.count >= 0,
              }}
            />
            <MetricCard
              title={t("averagePurchase")}
              value={formatCurrency(reportData.metrics.current.average)}
              trend={{
                value: reportData.metrics.change.average,
                isPositive: reportData.metrics.change.average >= 0,
              }}
            />
          </div>

          {/* Summary or Detailed View */}
          {viewMode === "summary" ? (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("purchaseReport")}
                </h3>
                <DataTable
                  columns={summaryColumns}
                  data={reportData.purchases}
                  showPagination
                  pageSize={10}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("transactionDetails")}
                </h3>
                <ExpandableTable
                  data={reportData.purchases}
                  columns={detailedColumns}
                  renderExpandedContent={renderExpandedContent}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
