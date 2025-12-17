"use client";

import { Settings, History, Package, AlertTriangle, TrendingUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  t: (key: string) => string
) => {
  if (stock === 0) {
    return {
      label: t("outOfStock"),
      variant: "destructive" as const,
      icon: <AlertTriangle className="h-3 w-3" />,
    };
  }
  if (minStock && stock <= minStock) {
    return {
      label: t("lowStock"),
      variant: "secondary" as const,
      icon: <AlertTriangle className="h-3 w-3" />,
    };
  }
  return {
    label: t("inStock"),
    variant: "default" as const,
    icon: <Package className="h-3 w-3" />,
  };
};

export function InventoryCard({
  item,
  onAdjust,
  onViewHistory,
  canAdjust = true,
}: InventoryCardProps) {
  const t = useTranslations("Inventory");
  const status = getStockStatus(item.currentStock, item.product.minStock, t);

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Nombre + Estado de Stock */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{item.product.name}</h3>
            {item.product.sku && (
              <div className="flex items-center gap-1 mt-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">
                  {item.product.sku}
                </span>
              </div>
            )}
          </div>
          <Badge variant={status.variant} className="shrink-0">
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>

        <Separator />

        {/* Categoría */}
        {item.product.category && (
          <>
            <div className="text-sm text-muted-foreground">
              {item.product.category.name}
            </div>
            <Separator />
          </>
        )}

        {/* Stock Actual */}
        <div className="bg-primary/5 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t("currentStock")}</p>
              <p className="text-3xl font-bold">{formatNumber(item.currentStock)}</p>
            </div>
            <Package className="h-8 w-8 text-primary/40" />
          </div>
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {item.product.minStock !== null && (
            <div>
              <p className="text-xs text-muted-foreground">{t("minStock")}</p>
              <p className="font-medium">{formatNumber(item.product.minStock)}</p>
            </div>
          )}
          
          {item.product.cost && (
            <div>
              <p className="text-xs text-muted-foreground">{t("unitCost")}</p>
              <p className="font-medium">{formatCurrency(item.product.cost)}</p>
            </div>
          )}
        </div>

        {/* Movimientos Recientes */}
        {item.lastMovement && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>
                {t("lastMovement")}: {new Date(item.lastMovement).toLocaleDateString()}
              </span>
            </div>
          </>
        )}

        <Separator />

        {/* Footer: Botones de Acción */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory();
            }}
          >
            <History className="h-4 w-4 mr-2" />
            {t("viewHistory")}
          </Button>
          
          {canAdjust && (
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust();
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("adjust")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

