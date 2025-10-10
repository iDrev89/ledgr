"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses";
import type { ExpenseWithDetails } from "@/lib/types/expenses";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "@/lib/validations/expenses";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseWithDetails;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseDialogProps) {
  const t = useTranslations("Expenses");
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    data: CreateExpenseInput | UpdateExpenseInput
  ) => {
    try {
      if (expense) {
        await updateMutation.mutateAsync(data as UpdateExpenseInput);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateExpenseInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(expense ? t("updateError") : t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expense ? t("updateExpense") : t("createExpense")}
          </DialogTitle>
          <DialogDescription>
            {expense ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          expense={expense}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
