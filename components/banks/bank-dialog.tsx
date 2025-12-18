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
import { BankForm } from "./bank-form";
import { useCreateBank, useUpdateBank } from "@/hooks/use-banks";
import type { Bank } from "@/lib/types/bank";
import type { CreateBankInput, UpdateBankInput } from "@/lib/validations/bank";

interface BankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank?: Bank | null;
}

export function BankDialog({ open, onOpenChange, bank }: BankDialogProps) {
  const t = useTranslations("Banks");
  const createMutation = useCreateBank();
  const updateMutation = useUpdateBank();

  const handleSubmit = async (data: CreateBankInput | UpdateBankInput) => {
    try {
      if (bank && "id" in data) {
        await updateMutation.mutateAsync(data);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateBankInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(bank ? t("updateError") : t("createError"), {
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
            <DialogTitle>{bank ? t("editBank") : t("createBank")}</DialogTitle>
            <DialogDescription>
              {bank ? t("editBankDescription") : t("createBankDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <BankForm
              bank={bank || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
