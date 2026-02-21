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
import { useDeleteCashClose } from "@/hooks/use-cash-close";
import type { CashCloseWithRelations } from "@/lib/types/cash-close";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { CashCloseCard } from "./cash-close-card";
import { createCashCloseColumns } from "./cash-close-columns";

interface CashCloseTableProps {
  cashCloses: CashCloseWithRelations[];
  enablePagination?: boolean;
}

export function CashCloseTable({
  cashCloses,
  enablePagination = true,
}: CashCloseTableProps) {
  const t = useTranslations("CashClose");
  const [itemToDelete, setItemToDelete] =
    useState<CashCloseWithRelations | null>(null);
  const deleteMutation = useDeleteCashClose();

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

  const columns = createCashCloseColumns({
    onDelete: setItemToDelete,
    t,
  });

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        renderCard={(cashClose) => (
          <CashCloseCard
            cashClose={cashClose}
            onDelete={() => setItemToDelete(cashClose)}
          />
        )}
        data={cashCloses}
        showPagination
        enablePagination={enablePagination}
        pageSize={10}
        emptyMessage={t("noCashCloses")}
        onDelete={setItemToDelete}
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
