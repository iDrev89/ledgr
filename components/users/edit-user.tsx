"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Edit, Loader2 } from "lucide-react";
import { User, useUpdateUser, UserRole } from "@/hooks/use-users";
import {
  useUserBranches,
  useAssignUserToBranch,
  useRemoveUserFromBranch,
} from "@/hooks/use-branches";
import { BranchSelector } from "@/components/ui/branch-selector";
import { toast } from "sonner";
import { updateUserSchema, type UpdateUserInput } from "@/lib/validations/user";
import { useTranslations } from "next-intl";

interface EditUserProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUser({ user, open, onOpenChange }: EditUserProps) {
  const t = useTranslations("Users");
  const updateUserMutation = useUpdateUser();
  const assignBranchMutation = useAssignUserToBranch();
  const removeBranchMutation = useRemoveUserFromBranch();
  const { data: userBranches } = useUserBranches(user.id);

  const currentBranchId = userBranches?.[0]?.branchId ?? null;
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedBranchId(currentBranchId);
  }, [currentBranchId]);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: (user.role as UpdateUserInput["role"]) || UserRole.USER,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: (user.role as UpdateUserInput["role"]) || UserRole.USER,
      });
    }
  }, [user, form]);

  const isLoading =
    updateUserMutation.isPending ||
    assignBranchMutation.isPending ||
    removeBranchMutation.isPending;

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        ...data,
      });

      const branchChanged = selectedBranchId !== currentBranchId;
      if (branchChanged) {
        if (currentBranchId) {
          await removeBranchMutation.mutateAsync({
            userId: user.id,
            branchId: currentBranchId,
          });
        }
        if (selectedBranchId) {
          await assignBranchMutation.mutateAsync({
            userId: user.id,
            branchId: selectedBranchId,
          });
        }
      }

      toast.success(t("userUpdatedSuccess"));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t("updateUserError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t("editUser")}
          </DialogTitle>
          <DialogDescription>{t("updateUserInfo")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("name")}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("email")}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("role")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.USER}>
                          {t("roleUser")}
                        </SelectItem>
                        <SelectItem value={UserRole.ADMIN}>
                          {t("roleAdmin")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>{t("branch")}</FormLabel>
                <BranchSelector
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                  disabled={isLoading}
                />
                <FormDescription>{t("branchDescription")}</FormDescription>
              </div>
            </div>

            {updateUserMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {updateUserMutation.error.message || t("updateUserError")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
