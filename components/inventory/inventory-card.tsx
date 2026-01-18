"use client";

import { Settings, History, Package, AlertTriangle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductStock } from "@/lib/types/inventory";
import { useTranslations } from "next-intl";

interface InventoryCardProps {
  item: ProductStock;
  onAdjust: () => void;
  onViewHistory: () => void;
  canAdjust?: boolean;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("es-CO").format(value);
};

const formatCurrency = (value: number | string) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

const getStockStatus = (
  stock: number,
  minStock: number | null,
  t: (key: string) => string,
) => {
  if (stock === 0) {
    return {
      label: t("outOfStock"),
      variant: "destructive" as const,
    };
  }
  if (minStock && stock <= minStock) {
    return {
      label: t("lowStock"),
      variant: "secondary" as const,
    };
  }
  return {
    label: t("inStock"),
    variant: "default" as const,
  };
};

export function InventoryCard({
  item,
  onAdjust,
  onViewHistory,
  canAdjust = true,
}: InventoryCardProps) {
  const t = useTranslations("Inventory");
  const status = getStockStatus(item.currentStock, null, t);

  return (
    <Card className="rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header: Nombre + Estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {item.product.name}
            </h3>
            {item.product.sku && (
              <div className="flex items-center gap-1 mt-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">
                  {item.product.sku}
                </span>
              </div>
            )}
          </div>
          <Badge variant={status.variant} className="text-xs shrink-0">
            {status.label}
          </Badge>
        </div>

        {/* Stock Actual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("currentStock")}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {formatNumber(item.currentStock)}
            </p>
          </div>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Costo unitario si existe */}
        {item.product.cost && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("unitCost")}</span>
            <span className="font-medium">
              {formatCurrency(parseFloat(item.product.cost.toString()))}
            </span>
          </div>
        )}

        {/* Último movimiento */}
        {item.lastMovement && (
          <p className="text-xs text-muted-foreground">
            {t("lastMovement")}:{" "}
            {new Date(item.lastMovement.createdAt).toLocaleDateString()}
          </p>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory();
            }}
          >
            <History className="h-3 w-3 mr-1.5" />
            {t("history")}
          </Button>

          {canAdjust && (
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust();
              }}
            >
              <Settings className="h-3 w-3 mr-1.5" />
              {t("adjust")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
