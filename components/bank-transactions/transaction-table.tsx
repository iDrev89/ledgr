"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { useDeleteBankTransaction } from "@/hooks/use-bank-transactions";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { DataTable } from "@/components/ui/data-table";
import { createTransactionColumns } from "./transaction-columns";

interface TransactionTableProps {
  transactions: BankTransactionWithRelations[];
  onEdit: (transaction: BankTransactionWithRelations) => void;
}

export const TransactionTable = ({ transactions, onEdit }: TransactionTableProps) => {
  const t = useTranslations("BankTransactions");
  const locale = useLocale();
  const [transactionToDelete, setTransactionToDelete] =
    useState<BankTransactionWithRelations | null>(null);
  const deleteMutation = useDeleteBankTransaction();

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteMutation.mutateAsync(transactionToDelete.id);
      setTransactionToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createTransactionColumns({
    onEdit,
    onDelete: setTransactionToDelete,
    t,
    locale,
  });

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noTransactions")}</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={transactions}
        searchKey={["description", "reference"]}
        searchPlaceholder={t("searchPlaceholder")}
        showPagination
        pageSize={20}
      />

      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setTransactionToDelete(null);
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

