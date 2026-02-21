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
import { BranchForm } from "./branch-form";
import { useCreateBranch, useUpdateBranch } from "@/hooks/use-branches";
import type { Branch } from "@/lib/types/branch";
import type { CreateBranchInput, UpdateBranchInput } from "@/lib/validations/branch";

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
}

export function BranchDialog({ open, onOpenChange, branch }: BranchDialogProps) {
  const t = useTranslations("Branches");
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const handleSubmit = async (data: CreateBranchInput | UpdateBranchInput) => {
    try {
      if (branch && "id" in data) {
        await updateMutation.mutateAsync(data);
        toast.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(data as CreateBranchInput);
        toast.success(t("createSuccess"));
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(branch ? t("updateError") : t("createError"), {
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
            <DialogTitle>{branch ? t("editBranch") : t("createBranch")}</DialogTitle>
            <DialogDescription>
              {branch ? t("editBranchDescription") : t("createBranchDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <BranchForm
              branch={branch || undefined}
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
