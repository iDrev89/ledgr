"use client";

import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Edit, Loader2 } from "lucide-react";
import { User, useUpdateUser, UserRole } from "@/hooks/use-users";
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

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: (user.role as UpdateUserInput["role"]) || UserRole.USER,
      allowedAccess: user.allowedAccess ?? false,
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: (user.role as UpdateUserInput["role"]) || UserRole.USER,
        allowedAccess: user.allowedAccess ?? false,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        ...data,
      });
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
                        disabled={updateUserMutation.isPending}
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
                        disabled={updateUserMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={updateUserMutation.isPending}
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

            <FormField
              control={form.control}
              name="allowedAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("allowedAccess")}</FormLabel>
                    <FormDescription>{t("allowedAccessHelper")}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={updateUserMutation.isPending}
                      aria-label={t("allowedAccess")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                disabled={updateUserMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
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
