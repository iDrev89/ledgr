"use client";

import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Package,
  DollarSign,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "./metric-card";
import { usePurchaseReport } from "@/hooks/use-reports";
import type { DateRange } from "@/lib/types/reports";
import type { PurchaseStatus } from "@/prisma/prisma-client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface PurchaseReportProps {
  dateRange: DateRange;
  locale?: string;
}

export function PurchaseReport({
  dateRange,
  locale = "es",
}: PurchaseReportProps) {
  const t = useTranslations("Reports");
  const dateLocale = locale === "es" ? es : enUS;

  const { data, isLoading, error } = usePurchaseReport({
    startDate: format(dateRange.start, "yyyy-MM-dd"),
    endDate: format(dateRange.end, "yyyy-MM-dd"),
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: t("purchaseDate"),
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "PPP", {
          locale: dateLocale,
        });
      },
    },
    {
      accessorKey: "invoiceNo",
      header: t("invoiceNo"),
      cell: ({ row }) => {
        return row.original.invoiceNo || "-";
      },
    },
    {
      accessorKey: "supplier.name",
      header: t("supplier"),
      cell: ({ row }) => {
        return row.original.supplier?.name || "-";
      },
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        return getStatusBadge(row.original.status);
      },
    },
    {
      accessorKey: "subtotal",
      header: t("subtotal"),
      cell: ({ row }) => {
        return formatCurrency(row.original.subtotal);
      },
    },
    {
      accessorKey: "taxTotal",
      header: t("taxTotal"),
      cell: ({ row }) => {
        return formatCurrency(row.original.taxTotal);
      },
    },
    {
      accessorKey: "total",
      header: t("total"),
      cell: ({ row }) => {
        return formatCurrency(row.original.total);
      },
    },
    {
      accessorKey: "totalPaid",
      header: t("paid"),
      cell: ({ row }) => {
        return formatCurrency(row.original.totalPaid);
      },
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
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
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
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title={t("totalPurchases")}
          value={formatCurrency(data.metrics.totalPurchases)}
          icon={<ShoppingCart />}
        />
        <MetricCard
          title={t("totalPaid")}
          value={formatCurrency(data.metrics.totalPaid)}
          icon={<DollarSign />}
        />
        <MetricCard
          title={t("pendingBalance")}
          value={formatCurrency(data.metrics.balance)}
          icon={<Receipt />}
          className={data.metrics.balance > 0 ? "border-amber-200" : ""}
        />
        <MetricCard
          title={t("purchaseCount")}
          value={data.metrics.count}
          icon={<Package />}
        />
        <MetricCard
          title={t("averagePurchase")}
          value={formatCurrency(data.metrics.average)}
        />
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("purchaseReport")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.purchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("noPurchases")}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data.purchases}
              showPagination
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
