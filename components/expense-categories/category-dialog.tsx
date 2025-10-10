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
import { CategoryForm } from "./category-form";
import {
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
} from "@/hooks/use-expense-categories";
import type { ExpenseCategoryWithRelations } from "@/lib/types/expense-categories";
import type { CreateExpenseCategoryInput } from "@/lib/validations/expense-categories";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExpenseCategoryWithRelations;
  onSuccess?: (category: ExpenseCategoryWithRelations) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const t = useTranslations("ExpenseCategories");
  const createMutation = useCreateExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();

  const isEdit = !!category;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CreateExpenseCategoryInput) => {
    try {
      let result: ExpenseCategoryWithRelations;
      if (isEdit) {
        result = await updateMutation.mutateAsync({
          id: category.id,
          ...data,
        });
        toast.success(t("updateSuccess"));
      } else {
        result = await createMutation.mutateAsync(data);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast.error(isEdit ? t("updateError") : t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editCategory") : t("createCategory")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

