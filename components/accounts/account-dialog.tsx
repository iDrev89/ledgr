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
import { AccountForm } from "./account-form";
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";
import type { Account } from "@/lib/types/account";
import type { CreateAccountInput, UpdateAccountInput } from "@/lib/validations/account";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

export function AccountDialog({ open, onOpenChange, account }: AccountDialogProps) {
  const t = useTranslations("Accounts");
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const handleSubmit = async (data: CreateAccountInput | UpdateAccountInput) => {
    try {
      if (account && "id" in data) {
        await updateMutation.mutateAsync(data);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateAccountInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(account ? t("updateError") : t("createError"), {
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
            <DialogTitle>{account ? t("editAccount") : t("createAccount")}</DialogTitle>
            <DialogDescription>
              {account ? t("editAccountDescription") : t("createAccountDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <AccountForm
              account={account || undefined}
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
