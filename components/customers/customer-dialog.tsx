"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  onSuccess?: (customer: Customer) => void;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const t = useTranslations("Customers");
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    data: CreateCustomerInput | UpdateCustomerInput,
  ) => {
    try {
      let result: Customer;
      if (customer) {
        result = await updateMutation.mutateAsync(data as UpdateCustomerInput);
        toast.success(t("updateSuccess"));
      } else {
        result = await createMutation.mutateAsync(data as CreateCustomerInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast.error(customer ? t("updateError") : t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] flex flex-col p-0 gap-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-6 pt-6 pb-4 shrink-0 border-b">
          <SheetHeader>
            <SheetTitle>
              {customer ? t("editCustomer") : t("createCustomer")}
            </SheetTitle>
            <SheetDescription>
              {customer ? t("editDescription") : t("createDescription")}
            </SheetDescription>
          </SheetHeader>
        </div>
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          onFocus={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
              setTimeout(() => {
                target.scrollIntoView({ block: "center", behavior: "smooth" });
              }, 50);
            }
          }}
        >
          <div className="px-6 py-5">
            <CustomerForm
              customer={customer}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
