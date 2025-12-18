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
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryForm } from "./category-form";
import {
  useCreateProductCategory,
  useUpdateProductCategory,
} from "@/hooks/use-product-categories";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";
import type { CreateProductCategoryInput } from "@/lib/validations/product-categories";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategoryWithRelations;
  onSuccess?: (category: ProductCategoryWithRelations) => void;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) => {
  const t = useTranslations("ProductCategories");
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();

  const isEdit = !!category;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CreateProductCategoryInput) => {
    try {
      let result: ProductCategoryWithRelations;
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
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("editCategory") : t("createCategory")}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? t("editDescription") : t("createDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <CategoryForm
              category={category}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
