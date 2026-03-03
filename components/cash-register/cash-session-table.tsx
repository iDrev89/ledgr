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
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { useDeleteCashSession } from "@/hooks/use-cash-session";
import type { CashSessionWithRelations } from "@/lib/types/cash-session";
import { createCashSessionColumns } from "./cash-session-columns";
import { CashSessionCard } from "./cash-session-card";
import { CashSessionDetailDialog } from "./cash-session-detail-dialog";

interface CashSessionTableProps {
  sessions: CashSessionWithRelations[];
}

export const CashSessionTable = ({ sessions }: CashSessionTableProps) => {
  const t = useTranslations("CashRegister");
  const [itemToDelete, setItemToDelete] =
    useState<CashSessionWithRelations | null>(null);
  const [itemToView, setItemToView] =
    useState<CashSessionWithRelations | null>(null);
  const deleteMutation = useDeleteCashSession();

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setItemToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const columns = createCashSessionColumns({
    onView: setItemToView,
    onDelete: setItemToDelete,
  });

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        data={sessions}
        renderCard={(session) => (
          <CashSessionCard
            session={session}
            onView={() => setItemToView(session)}
            onDelete={() => setItemToDelete(session)}
          />
        )}
        showPagination
        enablePagination
        pageSize={10}
        emptyMessage={t("noSessions")}
      />

      <CashSessionDetailDialog
        open={!!itemToView}
        onOpenChange={(open) => {
          if (!open) setItemToView(null);
        }}
        session={itemToView}
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
};
