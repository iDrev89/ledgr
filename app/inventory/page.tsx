"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { StockMovementDialog } from "@/components/inventory/stock-movement-dialog";
import { StockMovementHistory } from "@/components/inventory/stock-movement-history";
import { useInventorySummary } from "@/hooks/use-inventory";
import { usePermissions } from "@/hooks/use-permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProductStock } from "@/lib/types/inventory";
import { StatsCard } from "@/components/shared/stats-card";
import type { Product } from "@/lib/types/product";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/ui/search-input";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import { BranchSelector } from "@/components/ui/branch-selector";
import { useActiveBranch } from "@/hooks/use-active-branch";
import { StockTransferDialog } from "@/components/inventory/stock-transfer-dialog";

export default function InventoryPage() {
  const t = useTranslations("Inventory");
  const { hasPermission } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { activeBranchId } = useActiveBranch();
  const [branchFilter, setBranchFilter] = useState<string | null>(null);

  // Search and Pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  useEffect(() => {
    if (activeBranchId && branchFilter === null) {
      setBranchFilter(activeBranchId);
    }
  }, [activeBranchId, branchFilter]);

  useEffect(() => {
    pagination.setPage(0);
  }, [debouncedSearch, branchFilter]);

  const { data, isLoading, error, isFetching } = useInventorySummary({
    search: debouncedSearch || undefined,
    branchId: branchFilter || undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });
  const isSearching = isFetching && !isLoading;

  // Check permissions
  const canCreate = hasPermission("inventory", "create");
  const canUpdate = hasPermission("inventory", "update");

  const handleAddMovement = () => {
    if (!canCreate) return;
    setSelectedProductId(undefined);
    setDialogOpen(true);
  };

  const handleAdjust = (item: ProductStock) => {
    if (!canUpdate) return;
    setSelectedProductId(item.product.id);
    setDialogOpen(true);
  };

  const handleViewHistory = (item: ProductStock) => {
    setSelectedProduct(item.product);
    setHistoryOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProductId(undefined);
  };

  const handleHistoryClose = () => {
    setHistoryOpen(false);
    setSelectedProduct(null);
  };

  // Statistics from server
  const stats = data?.stats || {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {canCreate && (
            <StockTransferDialog />
          )}
          {canCreate && (
            <Button onClick={handleAddMovement} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("addMovement")}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard
          label={t("totalProducts")}
          value={stats.totalProducts}
          icon={Package}
          isLoading={isLoading}
        />
        <StatsCard
          label={t("inStock")}
          value={stats.inStock}
          icon={Package}
          isLoading={isLoading}
        />
        <StatsCard
          label={t("lowStock")}
          value={stats.lowStock}
          icon={AlertCircle}
          isLoading={isLoading}
        />
        <StatsCard
          label={t("outOfStock")}
          value={stats.outOfStock}
          icon={AlertCircle}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t("inventoryList")}</CardTitle>
              <CardDescription>{t("inventoryListDescription")}</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="w-full md:w-[200px]">
                <BranchSelector
                  value={branchFilter}
                  onValueChange={setBranchFilter}
                  allowNone
                />
              </div>
              <div className="w-full md:min-w-[300px]">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t("searchPlaceholder")}
                  isLoading={isSearching}
                />
              </div>
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
              <InventoryTable
                inventory={data?.items || []}
                onAdjust={handleAdjust}
                onViewHistory={handleViewHistory}
                canAdjust={canUpdate}
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

      <StockMovementDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        productId={selectedProductId}
        branchId={branchFilter || activeBranchId}
      />

      <StockMovementHistory
        open={historyOpen}
        onOpenChange={handleHistoryClose}
        product={selectedProduct}
        branchId={branchFilter || undefined}
      />
    </div>
  );
}
