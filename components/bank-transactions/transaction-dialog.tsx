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
import { TransactionForm } from "./transaction-form";
import {
  useCreateBankTransaction,
  useUpdateBankTransaction,
} from "@/hooks/use-bank-transactions";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import type { CreateTransactionInput } from "@/lib/validations/bank-transactions";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: BankTransactionWithRelations;
  defaultBankId?: string;
  onSuccess?: (transaction: BankTransactionWithRelations) => void;
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  transaction,
  defaultBankId,
  onSuccess,
}: TransactionDialogProps) => {
  const t = useTranslations("BankTransactions");
  const createMutation = useCreateBankTransaction();
  const updateMutation = useUpdateBankTransaction();

  const isEdit = !!transaction;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CreateTransactionInput) => {
    try {
      let result: BankTransactionWithRelations;
      if (isEdit) {
        result = await updateMutation.mutateAsync({
          id: transaction.id,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editTransaction") : t("createTransaction")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          defaultBankId={defaultBankId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

