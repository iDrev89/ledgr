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
import { ProductForm } from "./product-form";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import type { Product } from "@/lib/types/product";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/validations/product";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
}: ProductDialogProps) {
  const t = useTranslations("Products");
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    data: CreateProductInput | UpdateProductInput
  ) => {
    try {
      if (product) {
        await updateMutation.mutateAsync(data as UpdateProductInput);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateProductInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(product ? t("updateError") : t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>
              {product ? t("editProduct") : t("createProduct")}
            </DialogTitle>
            <DialogDescription>
              {product ? t("editDescription") : t("createDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <ProductForm
              product={product}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
