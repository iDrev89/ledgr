"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { SupplierCard } from "./supplier-card";
import { createSupplierColumns } from "./supplier-columns";
import { useDeleteSupplier } from "@/hooks/use-suppliers";
import type { Supplier } from "@/prisma/prisma-client";
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

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
}

export function SupplierTable({ suppliers, onEdit }: SupplierTableProps) {
  const t = useTranslations("Suppliers");
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const deleteMutation = useDeleteSupplier();

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteMutation.mutateAsync(supplierToDelete.id);
      toast.success(t("deleteSuccess"));
      setSupplierToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("deleteError")
      );
    }
  };

  const columns = createSupplierColumns({
    onEdit,
    onDelete: handleDelete,
    t,
  });

  return (
    <>
      <ResponsiveDataView
        data={suppliers}
        columns={columns}
        searchKey={["name", "email", "phone", "taxId"]}
        searchPlaceholder={t("searchPlaceholder")}
        renderCard={(supplier) => (
          <SupplierCard
            supplier={supplier}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        )}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!supplierToDelete}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmMessage", { name: supplierToDelete?.name })}
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

