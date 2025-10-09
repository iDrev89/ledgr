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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProductStock } from "@/lib/types/inventory";
import type { Product } from "@/lib/types/product";

export default function InventoryPage() {
  const t = useTranslations("Inventory");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, error } = useInventorySummary();

  const handleAddMovement = () => {
    setSelectedProductId(undefined);
    setDialogOpen(true);
  };

  const handleAdjust = (item: ProductStock) => {
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
    lowStock: data?.filter((item) => item.currentStock > 0 && item.currentStock <= 10).length || 0,
    outOfStock: data?.filter((item) => item.currentStock === 0).length || 0,
    inStock: data?.filter((item) => item.currentStock > 10).length || 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleAddMovement}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addMovement")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalProducts")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inStock")}
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.inStock}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("lowStock")}
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStock}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("outOfStock")}
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.outOfStock}
            </div>
          </CardContent>
        </Card>
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

