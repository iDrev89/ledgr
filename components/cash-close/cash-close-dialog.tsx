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
import { CashCloseForm } from "./cash-close-form";
import { useCreateCashClose } from "@/hooks/use-cash-close";
import type { CashCloseInput } from "@/lib/validations/cash-close";

interface CashCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CashCloseDialog({ open, onOpenChange }: CashCloseDialogProps) {
  const t = useTranslations("CashClose");
  const createMutation = useCreateCashClose();

  const handleSubmit = async (data: CashCloseInput) => {
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

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("createCashClose")}</DialogTitle>
            <DialogDescription>{t("createCashCloseDescription")}</DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <CashCloseForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createMutation.isPending}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
