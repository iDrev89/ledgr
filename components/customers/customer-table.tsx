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
import { useDeleteCustomer } from "@/hooks/use-customers";
import type { Customer } from "@/lib/types/customer";
import { DataTable } from "@/components/ui/data-table";
import { createCustomerColumns } from "./customer-columns";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

export function CustomerTable({ customers, onEdit }: CustomerTableProps) {
  const t = useTranslations("Customers");
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const deleteMutation = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteMutation.mutateAsync(customerToDelete.id);
      setCustomerToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createCustomerColumns({
    onEdit,
    onDelete: setCustomerToDelete,
    t,
  });

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noCustomers")}</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={customers}
        searchKey={["name", "email", "phone"]}
        searchPlaceholder={t("searchPlaceholder")}
        showPagination
        pageSize={10}
      />

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setCustomerToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", { name: customerToDelete?.name || "" })}
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