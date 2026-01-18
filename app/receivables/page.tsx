"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertCircle, Receipt, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { ReceivableTable } from "@/components/receivables/receivable-table";
import { ReceivableDetailDialog } from "@/components/receivables/receivable-detail-dialog";
import { ReceivablePaymentDialog } from "@/components/receivables/receivable-payment-dialog";
import { useReceivables, useCancelReceivable } from "@/hooks/use-receivables";
import { StatsCard } from "@/components/shared/stats-card";
import type { ReceivableWithDetails } from "@/lib/types/receivables";

type FilterType = "all" | "pending";

export default function ReceivablesPage() {
  const t = useTranslations("Receivables");
  const locale = useLocale();
  const [selectedReceivable, setSelectedReceivable] =
    useState<ReceivableWithDetails | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("pending");

  // Search and Pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  // Reset pagination when search or filter changes
  useEffect(() => {
    pagination.setPage(0);
  }, [debouncedSearch, filter]);

  const { data, isLoading, isFetching, error } = useReceivables({
    search: debouncedSearch || undefined,
    status: filter === "pending" ? ["OPEN", "PARTIAL"] : undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });
  const isSearching = isFetching && !isLoading;

  const cancelMutation = useCancelReceivable();
  const receivables = data?.receivables || [];

  const handleView = (receivable: ReceivableWithDetails) => {
    setSelectedReceivable(receivable);
    setDetailDialogOpen(true);
  };

  const handlePayment = (receivable: ReceivableWithDetails) => {
    setSelectedReceivable(receivable);
    setPaymentDialogOpen(true);
  };

  const handleCancel = (receivable: ReceivableWithDetails) => {
    setSelectedReceivable(receivable);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReceivable) return;

    try {
      await cancelMutation.mutateAsync(selectedReceivable.id);
      toast.success(t("cancelSuccess"));
      setCancelDialogOpen(false);
      setSelectedReceivable(null);
    } catch (error) {
      toast.error(t("cancelError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const totalBalance =
    data?.receivables.reduce((sum, r) => sum + parseFloat(r.balance), 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader pageTitle={t("title")} pageDes={t("description")} />

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <StatsCard
          label={t("totalReceivables")}
          value={data?.total || 0}
          icon={Receipt}
          isLoading={isLoading}
        />
        <StatsCard
          label={t("totalBalance")}
          value={formatCurrency(String(totalBalance))} // Use calculated total or from API if available
          icon={DollarSign}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t("receivablesList")}</CardTitle>
              <CardDescription>
                {t("receivablesListDescription")}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
              <div className="w-full sm:w-[250px]">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t("searchPlaceholder")}
                  isLoading={isSearching}
                />
              </div>
              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as FilterType)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                  <TabsTrigger value="all">{t("filterAll")}</TabsTrigger>
                  <TabsTrigger value="pending">
                    {t("filterPending")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : t("loadError")}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <ReceivableTable
                receivables={receivables}
                onView={handleView}
                onPayment={handlePayment}
                onCancel={handleCancel}
                t={t}
                locale={locale}
                enablePagination={false}
              />
              <PaginationControl
                currentPage={pagination.page}
                totalCount={data?.total || 0}
                pageSize={PAGE_SIZE}
                onPageChange={pagination.onPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <ReceivableDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        receivable={selectedReceivable}
        locale={locale}
      />

      <ReceivablePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        receivable={selectedReceivable}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("confirmCancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
