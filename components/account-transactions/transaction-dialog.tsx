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
import { TransactionForm } from "./transaction-form";
import {
  useCreateAccountTransaction,
  useUpdateAccountTransaction,
} from "@/hooks/use-account-transactions";
import type { AccountTransactionWithRelations } from "@/lib/types/account-transactions";
import type { CreateTransactionInput } from "@/lib/validations/account-transactions";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: AccountTransactionWithRelations;
  defaultAccountId?: string;
  onSuccess?: (transaction: AccountTransactionWithRelations) => void;
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  transaction,
  defaultAccountId,
  onSuccess,
}: TransactionDialogProps) => {
  const t = useTranslations("AccountTransactions");
  const createMutation = useCreateAccountTransaction();
  const updateMutation = useUpdateAccountTransaction();

  const isEdit = !!transaction;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CreateTransactionInput) => {
    try {
      let result: AccountTransactionWithRelations;
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("editTransaction") : t("createTransaction")}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? t("editDescription") : t("createDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <TransactionForm
              transaction={transaction}
              defaultAccountId={defaultAccountId}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
