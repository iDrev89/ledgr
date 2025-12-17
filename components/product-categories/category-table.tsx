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
import { useDeleteProductCategory } from "@/hooks/use-product-categories";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";
import { DataTable } from "@/components/ui/data-table";
import { createCategoryColumns } from "./category-columns";

interface CategoryTableProps {
  categories: ProductCategoryWithRelations[];
  onEdit: (category: ProductCategoryWithRelations) => void;
}

export const CategoryTable = ({ categories, onEdit }: CategoryTableProps) => {
  const t = useTranslations("ProductCategories");
  const [categoryToDelete, setCategoryToDelete] =
    useState<ProductCategoryWithRelations | null>(null);
  const deleteMutation = useDeleteProductCategory();

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

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noCategories")}</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={categories}
        searchKey={["name"]}
        searchPlaceholder={t("searchPlaceholder")}
        showPagination
        pageSize={10}
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
};
