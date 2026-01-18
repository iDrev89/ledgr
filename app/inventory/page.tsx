"use client";

import { useState } from "react";
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

export default function InventoryPage() {
  const t = useTranslations("Inventory");
  const { hasPermission } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, error } = useInventorySummary();

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

  // Calculate statistics
  const stats = {
    totalProducts: data?.length || 0,
    lowStock:
      data?.filter((item) => item.currentStock > 0 && item.currentStock <= 10)
        .length || 0,
    outOfStock: data?.filter((item) => item.currentStock === 0).length || 0,
    inStock: data?.filter((item) => item.currentStock > 10).length || 0,
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
        {canCreate && (
          <Button onClick={handleAddMovement} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t("addMovement")}
          </Button>
        )}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("inventoryList")}</CardTitle>
              <CardDescription>{t("inventoryListDescription")}</CardDescription>
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
            <InventoryTable
              inventory={data || []}
              onAdjust={handleAdjust}
              onViewHistory={handleViewHistory}
              canAdjust={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      <StockMovementDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        productId={selectedProductId}
      />

      <StockMovementHistory
        open={historyOpen}
        onOpenChange={handleHistoryClose}
        product={selectedProduct}
      />
    </div>
  );
}
