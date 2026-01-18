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
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { CustomerCard } from "./customer-card";
import { createCustomerColumns } from "./customer-columns";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  // Server-side search props
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean;
  enablePagination?: boolean;
}

export function CustomerTable({
  customers,
  onEdit,
  searchValue,
  onSearchChange,
  isSearching,
  enablePagination = true,
}: CustomerTableProps) {
  const t = useTranslations("Customers");
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
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

  return (
    <>
      <ResponsiveDataView
        columns={columns}
        renderCard={(customer) => (
          <CustomerCard
            customer={customer}
            onEdit={() => onEdit(customer)}
            onDelete={() => setCustomerToDelete(customer)}
          />
        )}
        data={customers}
        searchPlaceholder={t("searchPlaceholder")}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        isSearching={isSearching}
        showPagination
        enablePagination={enablePagination}
        pageSize={10}
        emptyMessage={t("noCustomers")}
        onEdit={onEdit}
        onDelete={setCustomerToDelete}
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
