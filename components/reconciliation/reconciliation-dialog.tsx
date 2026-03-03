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
import { ReconciliationForm } from "./reconciliation-form";
import { useCreateReconciliation } from "@/hooks/use-reconciliation";
import type { CreateReconciliationInput } from "@/lib/validations/reconciliation";

interface ReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReconciliationDialog({
  open,
  onOpenChange,
}: ReconciliationDialogProps) {
  const t = useTranslations("Reconciliation");
  const createMutation = useCreateReconciliation();

  const handleSubmit = async (data: CreateReconciliationInput) => {
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("createReconciliation")}</DialogTitle>
            <DialogDescription>{t("createDescription")}</DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <ReconciliationForm
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
