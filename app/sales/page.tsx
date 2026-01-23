"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Plus, AlertCircle, Check, CalendarIcon, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SaleTable } from "@/components/sales/sale-table";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { UserSelector } from "@/components/sales/user-selector";
import { SearchInput } from "@/components/ui/search-input";
import { useSales, useCompleteSale } from "@/hooks/use-sales";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermissions } from "@/hooks/use-permissions";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import type { SaleWithDetails } from "@/lib/types/sales";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SalesStatsCards } from "@/components/sales/sales-stats-cards";

export default function SalesPage() {
  const t = useTranslations("Sales");
  const locale = useLocale();
  const router = useRouter();
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("completed");
  const [saleToClose, setSaleToClose] = useState<SaleWithDetails | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { isAdmin } = usePermissions();
  const dateLocale = locale === "es" ? es : enUS;

  // Filter states for completed sales
  const [sellerId, setSellerId] = useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);

  // Pagination states
  const PAGE_SIZE = 10;
  // const [completedPage, setCompletedPage] = useState(0);
  // const [draftPage, setDraftPage] = useState(0);

  const completedPagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
    // totalCount is updated from query result
  });

  const draftPagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
    // totalCount is updated from query result
  });

  // Search states for each tab
  const [completedSearch, setCompletedSearch] = useState("");
  const debouncedCompletedSearch = useDebounce(completedSearch, 300);
  const [draftSearch, setDraftSearch] = useState("");
  const debouncedDraftSearch = useDebounce(draftSearch, 300);

  // Filter states for draft sales
  const [draftSellerId, setDraftSellerId] = useState<string | undefined>(
    undefined,
  );

  // Query for completed sales
  const {
    data: completedData,
    isLoading: completedLoading,
    error: completedError,
    isFetching: completedFetching,
  } = useSales({
    sellerId,
    dateFrom,
    dateTo,
    status: "COMPLETED",
    search: debouncedCompletedSearch || undefined,
    limit: PAGE_SIZE,
    offset: completedPagination.offset,
  });
  const isCompletedSearching = completedFetching && !completedLoading;

  // Query for draft sales
  const {
    data: draftData,
    isLoading: draftLoading,
    error: draftError,
    isFetching: draftFetching,
  } = useSales({
    sellerId: draftSellerId,
    status: "DRAFT",
    search: debouncedDraftSearch || undefined,
    limit: PAGE_SIZE,
    offset: draftPagination.offset,
  });
  const isDraftSearching = draftFetching && !draftLoading;

  const completeSaleMutation = useCompleteSale();

  const handleCreate = () => {
    router.push("/sales/new");
  };

  const handleViewSale = (sale: SaleWithDetails) => {
    setSelectedSale(sale);
    setDetailDialogOpen(true);
  };

  const handleFiltersChange = (filters: {
    sellerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setSellerId(filters.sellerId);
    setDateFrom(filters.dateFrom);
    setDateTo(filters.dateTo);
    completedPagination.setPage(0); // Reset to first page when filters change
  };

  const handleSellerChange = (newSellerId: string) => {
    setSellerId(newSellerId || undefined);
    completedPagination.setPage(0); // Reset to first page
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      setDateFrom(dateString);
      setDateTo(dateString);
      setDatePickerOpen(false);
      completedPagination.setPage(0); // Reset to first page
    }
  };

  const handleClearDate = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    completedPagination.setPage(0); // Reset to first page
  };

  const handleDraftFiltersChange = (filters: { sellerId?: string }) => {
    setDraftSellerId(filters.sellerId);
    draftPagination.setPage(0); // Reset to first page
  };

  const handleCloseSale = (sale: SaleWithDetails) => {
    setSaleToClose(sale);
    setCloseDialogOpen(true);
  };

  const confirmCloseSale = async () => {
    if (!saleToClose) return;

    try {
      await completeSaleMutation.mutateAsync(saleToClose.id);
      toast.success(t("saleClosedSuccess"));
      setCloseDialogOpen(false);
      setSaleToClose(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("closeSaleError"));
    }
  };

  const handleEditDraftSale = (sale: SaleWithDetails) => {
    router.push(`/sales/${sale.id}/edit`);
  };

  const handleEditCompletedSale = (sale: SaleWithDetails) => {
    router.push(`/sales/${sale.id}/edit`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header - aligned */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            {t("description")}
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("createSale")}
        </Button>
      </div>

      {/* Employee Sales Stats Cards */}
      <SalesStatsCards sellerId={sellerId} />

      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle>{t("salesHistory")}</CardTitle>
            <CardDescription>{t("salesHistoryDescription")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(tab) => {
              setActiveTab(tab);
              // Clear search when switching tabs
              if (tab === "completed") setDraftSearch("");
              else setCompletedSearch("");
            }}
          >
            {/* Tabs header & Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <TabsList className="w-full sm:w-auto grid grid-cols-2 h-10 p-1 bg-muted/50">
                  <TabsTrigger value="completed" className="px-4">
                    {t("completedSales")}{" "}
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {completedData?.total || 0}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="px-4">
                    {t("openSales")}{" "}
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {draftData?.total || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Search & Filters Toolbar */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <SearchInput
                    value={
                      activeTab === "completed" ? completedSearch : draftSearch
                    }
                    onChange={(value) => {
                      if (activeTab === "completed") {
                        setCompletedSearch(value);
                        completedPagination.setPage(0);
                      } else {
                        setDraftSearch(value);
                        draftPagination.setPage(0);
                      }
                    }}
                    placeholder={t("searchPlaceholder")}
                    isLoading={
                      activeTab === "completed"
                        ? isCompletedSearching
                        : isDraftSearching
                    }
                    className="w-full"
                  />
                </div>

                {/* Filters - Responsive Grid/Flex */}
                {activeTab === "completed" && isAdmin() && (
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
                      <UserSelector
                        value={sellerId}
                        onValueChange={handleSellerChange}
                        placeholder={t("allSellers")}
                      />
                    </div>
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 sm:flex-none justify-start text-left font-normal sm:w-[180px] gap-2.5",
                            !dateFrom && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 shrink-0 text-primary/70" />
                          {dateFrom ? (
                            <span className="truncate">
                              {format(parseISO(dateFrom), "dd/MM/yy", {
                                locale: dateLocale,
                              })}
                            </span>
                          ) : (
                            <span>{t("selectDate")}</span>
                          )}
                          {dateFrom && (
                            <X
                              className="h-3.5 w-3.5 ml-auto shrink-0 opacity-50 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearDate();
                              }}
                            />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={dateFrom ? parseISO(dateFrom) : undefined}
                          onSelect={handleDateChange}
                          locale={dateLocale}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Sales Tab */}
            <TabsContent value="completed" className="space-y-4 mt-0">
              {completedError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {completedError instanceof Error
                      ? completedError.message
                      : t("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {completedLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <SaleTable
                    sales={completedData?.sales || []}
                    onView={handleViewSale}
                    onEdit={handleEditCompletedSale}
                    locale={locale}
                    totalCount={completedData?.total}
                    page={completedPagination.page}
                    onPageChange={completedPagination.setPage}
                    enablePagination={false}
                  />
                  <PaginationControl
                    currentPage={completedPagination.page}
                    totalCount={completedData?.total || 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={completedPagination.onPageChange}
                  />
                </>
              )}
            </TabsContent>

            {/* Draft Sales Tab */}
            <TabsContent value="draft" className="space-y-4 mt-0">
              <div className="text-sm text-muted-foreground">
                {t("openSalesDescription")}
              </div>

              {draftError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {draftError instanceof Error
                      ? draftError.message
                      : t("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {draftLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <SaleTable
                    sales={draftData?.sales || []}
                    onView={handleViewSale}
                    onEdit={handleEditDraftSale}
                    onCloseSale={handleCloseSale}
                    isDraftTable
                    locale={locale}
                    totalCount={draftData?.total}
                    page={draftPagination.page}
                    onPageChange={draftPagination.setPage}
                    enablePagination={false}
                  />
                  <PaginationControl
                    currentPage={draftPagination.page}
                    totalCount={draftData?.total || 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={draftPagination.onPageChange}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SaleDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        sale={selectedSale}
        locale={locale}
      />

      {/* Close Sale Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmCloseSale")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("closeSaleWarning")}
            </AlertDialogDescription>
            {saleToClose && (
              <div className="mt-4 p-3 rounded-lg bg-muted space-y-1">
                <div className="font-medium text-sm">
                  {t("saleNumber")}: #
                  {String(saleToClose.saleNumber).padStart(4, "0")}
                </div>
                <div className="text-sm">
                  {t("customer")}: {saleToClose.customer?.name}
                </div>
                <div className="font-semibold text-sm">
                  {t("total")}:{" "}
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(parseFloat(saleToClose.total))}
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCloseSale}
              disabled={completeSaleMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              {completeSaleMutation.isPending ? t("closing") : t("closeSale")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
