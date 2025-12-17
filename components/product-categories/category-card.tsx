"use client";

import { Pencil, Trash2, Layers, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";
import { useTranslations } from "next-intl";

interface CategoryCardProps {
  category: ProductCategoryWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const t = useTranslations("ProductCategories");
  const productCount = category._count?.products || 0;

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Nombre + Estado + Acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-lg truncate">{category.name}</h3>
            </div>
            <Badge variant={category.active ? "default" : "outline"} className="mt-1">
              {category.active ? t("active") : t("inactive")}
            </Badge>
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

        {/* Descripción */}
        {category.description && (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          </>
        )}

        <Separator />

        {/* Contador de Productos */}
        <div className="flex items-center gap-2 bg-primary/5 rounded-md p-3">
          <Package className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t("productsCount")}</p>
            <p className="text-xl font-bold">{productCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

