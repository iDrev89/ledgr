"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertCircle,
  DollarSign,
  Receipt,
  ShoppingBag,
  CalendarIcon,
  X,
  Landmark,
  Banknote,
  Smartphone,
  Building2,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { ExportButton } from "@/components/reports/export-button";
import { BranchSelector } from "@/components/ui/branch-selector";
import { BusinessLineSelector } from "@/components/ui/business-line-selector";
import { useActiveBranch } from "@/hooks/use-active-branch";
import { useBusinessLines } from "@/hooks/use-business-lines";
import { MetricCard } from "@/components/reports/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { UserSelector } from "@/components/sales/user-selector";
import type { DailySaleDetail } from "@/lib/types/reports";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getDailySalesReport } from "@/apis/actions/reports";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { getPaymentMethodLabel } from "@/lib/payment-utils";

export default function DailySalesReportPage() {
  const t = useTranslations("Reports");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const { isAdmin } = usePermissions();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sellerId, setSellerId] = useState<string | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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
    queryKey: ["daily-sales-report", format(selectedDate, "yyyy-MM-dd"), sellerId, branchId, businessLineId],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await getDailySalesReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sellerId,
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

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const getPaymentStatusBadge = (status: 'paid' | 'partial' | 'pending') => {
    const variants = {
      paid: { label: t("paymentPaid"), variant: "default" as const },
      partial: { label: t("paymentPartial"), variant: "secondary" as const },
      pending: { label: t("paymentPending"), variant: "outline" as const },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabelLocalized = (method: string) =>
    getPaymentMethodLabel(method, t);

  const columns = useMemo<ColumnDef<DailySaleDetail>[]>(
    () => [
      {
        accessorKey: "saleNumber",
        header: t("saleNumber"),
        cell: ({ row }) => `#${String(row.original.saleNumber).padStart(4, "0")}`,
      },
      {
        accessorKey: "createdAt",
        header: t("dateTime"),
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), "HH:mm", {
            locale: dateLocale,
          }),
      },
      {
        accessorKey: "customerName",
        header: t("customer"),
        cell: ({ row }) => row.original.customerName || "-",
      },
      {
        accessorKey: "soldByName",
        header: t("seller"),
        cell: ({ row }) => row.original.soldByName || "-",
      },
      {
        accessorKey: "itemCount",
        header: t("items"),
        cell: ({ row }) => row.original.itemCount,
      },
      {
        accessorKey: "total",
        header: t("total"),
        cell: ({ row }) => formatCurrency(row.original.total),
      },
      {
        accessorKey: "paymentMethods",
        header: t("paymentMethods"),
        cell: ({ row }) => {
          const methods = row.original.paymentMethods;
          const status = row.original.paymentStatus;
          
          // If no payment methods recorded
          if (!methods || methods.length === 0) {
            // If the sale is marked as paid but no payment methods, show a note
            if (status === 'paid') {
              return <span className="text-muted-foreground text-xs italic">{t("noPaymentRecord")}</span>;
            }
            // If pending or partial, show dash
            return "-";
          }
          
          return methods.map((m) => getPaymentMethodLabelLocalized(m)).join(", ");
        },
      },
      {
        accessorKey: "paymentStatus",
        header: t("paymentStatus"),
        cell: ({ row }) => getPaymentStatusBadge(row.original.paymentStatus),
      },
    ],
    [t, dateLocale],
  );

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDatePickerOpen(false);
    }
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(new Date());
  };

  const handleSellerChange = (newSellerId: string) => {
    setSellerId(newSellerId || undefined);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          pageTitle={t("dailySalesTitle")}
          pageDes={t("dailySalesDescription")}
        />
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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
          pageTitle={t("dailySalesTitle")}
          pageDes={t("dailySalesDescription")}
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
        pageTitle={t("dailySalesTitle")}
        pageDes={t("dailySalesDescription")}
      />

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("selectDate")}
                </Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between font-normal",
                      )}
                    >
                      <span className="truncate">
                        {format(selectedDate, "dd/MM/yyyy", { locale: dateLocale })}
                      </span>
                      <div className="flex items-center gap-1">
                        {selectedDate.toDateString() !== new Date().toDateString() && (
                          <span
                            onClick={handleClearDate}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleClearDate(e as any);
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">{t("resetToToday")}</span>
                          </span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Seller Filter - Only for Admins */}
              {isAdmin() && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("filterBySeller")}
                  </Label>
                  <UserSelector
                    value={sellerId}
                    onValueChange={handleSellerChange}
                    placeholder={t("allSellers")}
                  />
                </div>
              )}

              {/* Branch Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("filterByBranch")}
                </Label>
                <BranchSelector
                  value={branchId}
                  onValueChange={setBranchId}
                  allowNone
                />
              </div>

              {/* Business Line Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("filterByBusinessLine")}
                </Label>
                <BusinessLineSelector
                  value={businessLineId}
                  onValueChange={setBusinessLineId}
                  allowNone
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="flex justify-end">
          <ExportButton
            type="daily-sales"
            data={reportData || null}
            date={selectedDate}
          />
        </div>
      </div>

      {reportData && (
        <>
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title={t("totalSales")}
              value={formatCurrency(reportData.metrics.totalSales)}
              icon={<DollarSign />}
            />
            <MetricCard
              title={t("salesCount")}
              value={reportData.metrics.salesCount}
              icon={<ShoppingBag />}
            />
            <MetricCard
              title={t("averageTicket")}
              value={formatCurrency(reportData.metrics.averageTicket)}
              icon={<Receipt />}
            />
          </div>

          {/* Income by Account Breakdown */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Landmark className="h-5 w-5 text-muted-foreground" />
                {t("incomeByAccount")}
              </h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {reportData.metrics.byAccount.map((account) => (
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

                {/* Pending Balance */}
                <div className="flex flex-col gap-1 p-4 rounded-lg border bg-destructive/5 border-destructive/20 hover:bg-destructive/10 transition-colors">
                  <span className="text-sm font-medium text-destructive">
                    {t("pendingBalance")}
                  </span>
                  <span className="text-2xl font-bold text-destructive">
                    {formatCurrency(reportData.metrics.pendingBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("salesDetail")} ({reportData.sales.length})
              </h3>
              {reportData.sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {t("noSalesForDate")}
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={reportData.sales}
                  showPagination
                  pageSize={20}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
