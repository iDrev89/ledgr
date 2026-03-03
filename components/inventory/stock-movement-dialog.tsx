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
import { StockMovementForm } from "./stock-movement-form";
import { useCreateStockMovement } from "@/hooks/use-inventory";
import type { CreateStockMovementInput } from "@/lib/validations/inventory";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  branchId?: string;
}

export function StockMovementDialog({
  open,
  onOpenChange,
  productId,
  branchId,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("addMovement")}</DialogTitle>
            <DialogDescription>{t("addMovementDescription")}</DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <StockMovementForm
              productId={productId}
              branchId={branchId}
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
