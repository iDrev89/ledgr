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
import { useDeleteSale } from "@/hooks/use-sales";
import type { SaleWithDetails } from "@/lib/types/sales";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { SaleCard } from "./sale-card";
import { createSaleColumns } from "./sale-columns";

interface SaleTableProps {
  sales: SaleWithDetails[];
  onView: (sale: SaleWithDetails) => void;
  locale?: string;
}

export function SaleTable({ sales, onView, locale }: SaleTableProps) {
  const t = useTranslations("Sales");
  const [saleToDelete, setSaleToDelete] = useState<SaleWithDetails | null>(null);
  const deleteMutation = useDeleteSale();

  const handleDelete = async () => {
    if (!saleToDelete) return;

    try {
      await deleteMutation.mutateAsync(saleToDelete.id);
      setSaleToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createSaleColumns({
    onView,
    onDelete: setSaleToDelete,
    t,
    locale,
  });

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        renderCard={(sale, actions) => (
          <SaleCard
            sale={sale}
            onView={() => onView(sale)}
            onDelete={() => setSaleToDelete(sale)}
            locale={locale}
          />
        )}
        data={sales}
        searchKey={["customer.name"]}
        searchPlaceholder={t("searchPlaceholder")}
        showPagination
        pageSize={10}
        emptyMessage={t("noSales")}
        onView={onView}
        onDelete={setSaleToDelete}
        locale={locale}
      />

      <AlertDialog
        open={!!saleToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setSaleToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", {
                number: saleToDelete?.saleNumber
                  ? String(saleToDelete.saleNumber).padStart(4, "0")
                  : "",
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

