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
import { useDeleteProduct } from "@/hooks/use-products";
import type { Product } from "@/lib/types/product";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ProductCard } from "./product-card";
import { createProductColumns } from "./product-columns";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  // Server-side search props
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean;
}

export function ProductTable({
  products,
  onEdit,
  searchValue,
  onSearchChange,
  isSearching,
}: ProductTableProps) {
  const t = useTranslations("Products");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createProductColumns({
    onEdit,
    onDelete: setProductToDelete,
    t,
  });

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        renderCard={(product) => (
          <ProductCard
            product={product}
            onEdit={() => onEdit(product)}
            onDelete={() => setProductToDelete(product)}
          />
        )}
        data={products}
        searchPlaceholder={t("searchPlaceholder")}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        isSearching={isSearching}
        showPagination
        pageSize={10}
        emptyMessage={t("noProducts")}
        onEdit={onEdit}
        onDelete={setProductToDelete}
      />

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", { name: productToDelete?.name || "" })}
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
