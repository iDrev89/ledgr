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
import { BusinessLineForm } from "./business-line-form";
import {
  useCreateBusinessLine,
  useUpdateBusinessLine,
} from "@/hooks/use-business-lines";
import type { BusinessLine } from "@/lib/types/business-line";
import type {
  CreateBusinessLineInput,
  UpdateBusinessLineInput,
} from "@/lib/validations/business-line";

interface BusinessLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessLine?: BusinessLine | null;
}

export function BusinessLineDialog({
  open,
  onOpenChange,
  businessLine,
}: BusinessLineDialogProps) {
  const t = useTranslations("BusinessLines");
  const createMutation = useCreateBusinessLine();
  const updateMutation = useUpdateBusinessLine();

  const handleSubmit = async (
    data: CreateBusinessLineInput | UpdateBusinessLineInput,
  ) => {
    try {
      if (businessLine && "id" in data) {
        await updateMutation.mutateAsync(data);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateBusinessLineInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(businessLine ? t("updateError") : t("createError"), {
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
            <DialogTitle>
              {businessLine
                ? t("editBusinessLine")
                : t("createBusinessLine")}
            </DialogTitle>
            <DialogDescription>
              {businessLine
                ? t("editBusinessLineDescription")
                : t("createBusinessLineDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <BusinessLineForm
              businessLine={businessLine || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={
                createMutation.isPending || updateMutation.isPending
              }
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
