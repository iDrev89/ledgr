"use client";

import { Pencil, Trash2, Package, Wrench, Tag, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@/lib/types/product";
import { ProductType } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const formatCurrency = (value: number | string) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const t = useTranslations("Products");
  const isProduct = product.type === ProductType.PRODUCT;

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Icono de Tipo + Nombre + Acciones */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isProduct
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            }`}
          >
            {isProduct ? (
              <Package className="h-5 w-5" />
            ) : (
              <Wrench className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Información: SKU, Categoría */}
        <div className="space-y-2">
          {product.sku && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-mono">{product.sku}</span>
            </div>
          )}
          
          {/* Category - Disabled: property not included in fetch */}
          {/* {product.category && (
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{product.category.name}</span>
            </div>
          )} */}
        </div>

        <Separator />

        {/* Detalles: Tipo + Precio */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={isProduct ? "default" : "secondary"}>
              {t(isProduct ? "typeProduct" : "typeService")}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t("price")}</p>
              <p className="text-lg font-bold">
                {formatCurrency(parseFloat(product.price.toString()))}
              </p>
            </div>
            {product.cost && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("cost")}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(parseFloat(product.cost.toString()))}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Estado + Stock (si está disponible) */}
        <Separator />
        <div className="flex items-center justify-between">
          <Badge variant={product.active ? "default" : "outline"}>
            {product.active ? t("active") : t("inactive")}
          </Badge>
          
          {/* Stock - Disabled: property not in schema */}
          {/* {product.currentStock !== undefined && isProduct && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("stock")}</p>
              <p className="text-sm font-medium">{product.currentStock}</p>
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}

