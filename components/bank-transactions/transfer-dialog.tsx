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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createTransfer")}</DialogTitle>
          <DialogDescription>
            {t("createTransferDescription")}
          </DialogDescription>
        </DialogHeader>
        <TransferForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

