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
import { useDeleteExpense } from "@/hooks/use-expenses";
import type { ExpenseWithDetails } from "@/lib/types/expenses";
import { DataTable } from "@/components/ui/data-table";
import { createExpenseColumns } from "./expense-columns";

interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  onView: (expense: ExpenseWithDetails) => void;
  onEdit: (expense: ExpenseWithDetails) => void;
  locale?: string;
}

export function ExpenseTable({ expenses, onView, onEdit, locale }: ExpenseTableProps) {
  const t = useTranslations("Expenses");
  const [expenseToDelete, setExpenseToDelete] =
    useState<ExpenseWithDetails | null>(null);
  const deleteMutation = useDeleteExpense();

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteMutation.mutateAsync(expenseToDelete.id);
      setExpenseToDelete(null);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const columns = createExpenseColumns({
    onView,
    onEdit,
    onDelete: setExpenseToDelete,
    t,
    locale,
  });

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noExpenses")}</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={expenses}
        searchKey={["description"]}
        searchPlaceholder={t("searchPlaceholder")}
        showPagination
        pageSize={10}
      />

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) {
            setExpenseToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", {
                description: expenseToDelete?.description || t("noDescription"),
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

