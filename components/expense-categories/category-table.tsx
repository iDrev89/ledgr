"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { useDeleteExpenseCategory } from "@/hooks/use-expense-categories";
import type { ExpenseCategoryWithRelations } from "@/lib/types/expense-categories";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { CategoryCard } from "./category-card";
import { createCategoryColumns } from "./category-columns";

interface CategoryTableProps {
  categories: ExpenseCategoryWithRelations[];
  onEdit: (category: ExpenseCategoryWithRelations) => void;
}

export function CategoryTable({ categories, onEdit }: CategoryTableProps) {
  const t = useTranslations("ExpenseCategories");
  const [categoryToDelete, setCategoryToDelete] =
    useState<ExpenseCategoryWithRelations | null>(null);
  const deleteMutation = useDeleteExpenseCategory();

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteMutation.mutateAsync(categoryToDelete.id);
      setCategoryToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createCategoryColumns({
    onEdit,
    onDelete: setCategoryToDelete,
    t,
  });

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        renderCard={(category) => (
          <CategoryCard
            category={category}
            onEdit={() => onEdit(category)}
            onDelete={() => setCategoryToDelete(category)}
          />
        )}
        data={categories}
        searchKey={["name"]}
        searchPlaceholder={t("searchPlaceholder")}
        showPagination
        pageSize={10}
        emptyMessage={t("noCategories")}
        onEdit={onEdit}
        onDelete={setCategoryToDelete}
      />

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", {
                name: categoryToDelete?.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
