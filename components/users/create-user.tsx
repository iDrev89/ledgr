"use client";

import { useState } from "react";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCreateUser, UserRole } from "@/hooks/use-users";
import { useAssignUserToBranch } from "@/hooks/use-branches";
import { BranchSelector } from "@/components/ui/branch-selector";
import { toast } from "sonner";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";
import { useTranslations } from "next-intl";

interface CreateUserProps {
  onSuccess: () => void;
}

export function CreateUser({ onSuccess }: CreateUserProps) {
  const t = useTranslations("Users");
  const createUserMutation = useCreateUser();
  const assignBranchMutation = useAssignUserToBranch();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.USER,
    },
  });

  const isLoading = createUserMutation.isPending || assignBranchMutation.isPending;

  const onSubmit = async (data: CreateUserInput) => {
    try {
      const result = await createUserMutation.mutateAsync(data);

      if (selectedBranchId && result?.id) {
        await assignBranchMutation.mutateAsync({
          userId: result.id,
          branchId: selectedBranchId,
        });
      }

      toast.success(t("userCreatedSuccess"));
      form.reset();
      setSelectedBranchId(null);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("createUserError"));
    }
  };

  return (
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("password")}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>{t("passwordHelper")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        <div className="space-y-2">
          <FormLabel>{t("branch")}</FormLabel>
          <BranchSelector
            value={selectedBranchId}
            onValueChange={setSelectedBranchId}
            disabled={isLoading}
          />
          <FormDescription>{t("branchDescription")}</FormDescription>
        </div>

        {createUserMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createUserMutation.error.message || t("createUserError")}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("creating")}
              </>
            ) : (
              t("create")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
