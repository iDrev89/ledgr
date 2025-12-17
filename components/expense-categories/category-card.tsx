"use client";

import { Pencil, Trash2, Layers, Receipt, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExpenseCategoryWithRelations } from "@/lib/types/expense-categories";
import { useTranslations } from "next-intl";

interface CategoryCardProps {
  category: ExpenseCategoryWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const t = useTranslations("ExpenseCategories");
  const expenseCount = category._count?.expenses || 0;
  const totalExpenses = (category as any).totalExpenses || 0;

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

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-primary/5 rounded-md p-3">
            <Receipt className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("expensesCount")}</p>
              <p className="text-lg font-bold">{expenseCount}</p>
            </div>
          </div>

          {totalExpenses > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-md p-3">
              <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t("totalSpent")}</p>
                <p className="text-sm font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

