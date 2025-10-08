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
import { CustomerForm } from "./customer-form";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import type { Customer } from "@/lib/types/customer";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/lib/validations/customer";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDialogProps) {
  const t = useTranslations("Customers");
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    data: CreateCustomerInput | UpdateCustomerInput
  ) => {
    try {
      if (customer) {
        await updateMutation.mutateAsync(data as UpdateCustomerInput);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateCustomerInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        customer ? t("updateError") : t("createError"),
        {
          description: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? t("editCustomer") : t("createCustomer")}
          </DialogTitle>
          <DialogDescription>
            {customer ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
