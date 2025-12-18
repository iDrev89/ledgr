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
import { TransferForm } from "./transfer-form";
import { useCreateBankTransfer } from "@/hooks/use-bank-transactions";
import type { CreateTransferInput } from "@/lib/validations/bank-transactions";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TransferDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: TransferDialogProps) => {
  const t = useTranslations("BankTransactions");
  const createMutation = useCreateBankTransfer();

  const handleSubmit = async (data: CreateTransferInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(t("transferSuccess"));
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(t("transferError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("createTransfer")}</DialogTitle>
            <DialogDescription>
              {t("createTransferDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <TransferForm
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
