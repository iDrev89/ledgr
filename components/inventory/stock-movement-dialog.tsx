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
import { StockMovementForm } from "./stock-movement-form";
import { useCreateStockMovement } from "@/hooks/use-inventory";
import type { CreateStockMovementInput } from "@/lib/validations/inventory";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}

export function StockMovementDialog({
  open,
  onOpenChange,
  productId,
}: StockMovementDialogProps) {
  const t = useTranslations("Inventory");
  const createMutation = useCreateStockMovement();

  const isLoading = createMutation.isPending;

  const handleSubmit = async (data: CreateStockMovementInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(t("createSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("addMovement")}</DialogTitle>
          <DialogDescription>{t("addMovementDescription")}</DialogDescription>
        </DialogHeader>
        <StockMovementForm
          productId={productId}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

