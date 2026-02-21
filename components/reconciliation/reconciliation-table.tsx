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
import { useDeleteReconciliation } from "@/hooks/use-reconciliation";
import type { ReconciliationWithRelations } from "@/lib/types/reconciliation";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ReconciliationCard } from "./reconciliation-card";
import { createReconciliationColumns } from "./reconciliation-columns";

interface ReconciliationTableProps {
  reconciliations: ReconciliationWithRelations[];
  onView: (reconciliation: ReconciliationWithRelations) => void;
  locale?: string;
  enablePagination?: boolean;
}

export function ReconciliationTable({
  reconciliations,
  onView,
  locale,
  enablePagination = true,
}: ReconciliationTableProps) {
  const t = useTranslations("Reconciliation");
  const [itemToDelete, setItemToDelete] =
    useState<ReconciliationWithRelations | null>(null);
  const deleteMutation = useDeleteReconciliation();

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setItemToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createReconciliationColumns({
    onView,
    onDelete: setItemToDelete,
    t,
    locale,
  });

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        renderCard={(reconciliation) => (
          <ReconciliationCard
            reconciliation={reconciliation}
            onView={() => onView(reconciliation)}
            onDelete={() => setItemToDelete(reconciliation)}
            locale={locale}
          />
        )}
        data={reconciliations}
        showPagination
        enablePagination={enablePagination}
        pageSize={10}
        emptyMessage={t("noReconciliations")}
        onView={onView}
        onDelete={setItemToDelete}
        locale={locale}
      />

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setItemToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription")}
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
