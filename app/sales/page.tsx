"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, Check } from "lucide-react";
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
import { SaleTable } from "@/components/sales/sale-table";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { SalesFilters } from "@/components/sales/sales-filters";
import { useSales, useCompleteSale } from "@/hooks/use-sales";
import type { SaleWithDetails } from "@/lib/types/sales";
import { toast } from "sonner";

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

  // Filter states for completed sales
  const [sellerId, setSellerId] = useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);

  // Filter states for draft sales
  const [draftSellerId, setDraftSellerId] = useState<string | undefined>(undefined);

  // Query for completed sales
  const { data: completedData, isLoading: completedLoading, error: completedError } = useSales({
    sellerId,
    dateFrom,
    dateTo,
    status: "COMPLETED",
  });

  // Query for draft sales
  const { data: draftData, isLoading: draftLoading, error: draftError } = useSales({
    sellerId: draftSellerId,
    status: "DRAFT",
  });

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
  };

  const handleDraftFiltersChange = (filters: {
    sellerId?: string;
  }) => {
    setDraftSellerId(filters.sellerId);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("createSale")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t("salesHistory")}</CardTitle>
            <CardDescription>{t("salesHistoryDescription")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="completed">
                {t("completedSales")} {completedData?.total ? `(${completedData.total})` : ""}
              </TabsTrigger>
              <TabsTrigger value="draft">
                {t("openSales")} {draftData?.total ? `(${draftData.total})` : ""}
              </TabsTrigger>
            </TabsList>

            {/* Completed Sales Tab */}
            <TabsContent value="completed" className="space-y-6">
              <SalesFilters
                sellerId={sellerId}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onFiltersChange={handleFiltersChange}
              />

              {completedError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {completedError instanceof Error ? completedError.message : t("loadError")}
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
                <SaleTable
                  sales={completedData?.sales || []}
                  onView={handleViewSale}
                  locale={locale}
                />
              )}
            </TabsContent>

            {/* Draft Sales Tab */}
            <TabsContent value="draft" className="space-y-6">
              <div className="text-sm text-muted-foreground">
                {t("openSalesDescription")}
              </div>

              {draftError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {draftError instanceof Error ? draftError.message : t("loadError")}
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
                <SaleTable
                  sales={draftData?.sales || []}
                  onView={handleViewSale}
                  onEdit={handleEditDraftSale}
                  onCloseSale={handleCloseSale}
                  isDraftTable
                  locale={locale}
                />
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
              {saleToClose && (
                <div className="mt-4 p-3 rounded-lg bg-muted space-y-1">
                  <p className="font-medium">
                    {t("saleNumber")}: #{String(saleToClose.saleNumber).padStart(4, "0")}
                  </p>
                  <p>{t("customer")}: {saleToClose.customer?.name}</p>
                  <p className="font-semibold">
                    {t("total")}: {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(parseFloat(saleToClose.total))}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
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
