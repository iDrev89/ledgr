"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { PurchaseCard } from "./purchase-card";
import { createPurchaseColumns } from "./purchase-columns";
import { PurchaseDetailDialog } from "./purchase-detail-dialog";
import { useDeletePurchase } from "@/hooks/use-purchases";
import type { SerializedPurchase } from "@/lib/types/purchases";
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

interface PurchaseTableProps {
  purchases: SerializedPurchase[];
  enablePagination?: boolean;
}

export function PurchaseTable({
  purchases,
  enablePagination = true,
}: PurchaseTableProps) {
  const t = useTranslations("Purchases");
  const [selectedPurchase, setSelectedPurchase] =
    useState<SerializedPurchase | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  const deleteMutation = useDeletePurchase();

  const handleView = (purchase: SerializedPurchase) => {
    setSelectedPurchase(purchase);
  };

  const handleDelete = (id: string) => {
    setPurchaseToDelete(id);
  };

  const confirmDelete = async () => {
    if (!purchaseToDelete) return;

    try {
      await deleteMutation.mutateAsync(purchaseToDelete);
      toast.success(t("deleteSuccess"));
      setPurchaseToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("deleteError"));
    }
  };

  const columns = createPurchaseColumns(handleView, handleDelete);

  return (
    <>
      <ResponsiveDataView
        data={purchases}
        columns={columns}
        showPagination
        enablePagination={enablePagination}
        renderCard={(purchase) => (
          <PurchaseCard
            purchase={purchase}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}
      />

      {/* Detail Dialog */}
      {selectedPurchase && (
        <PurchaseDetailDialog
          purchase={selectedPurchase}
          open={!!selectedPurchase}
          onOpenChange={(open) => !open && setSelectedPurchase(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!purchaseToDelete}
        onOpenChange={(open) => !open && setPurchaseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
