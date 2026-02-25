"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  getBranchSchemas,
  type CreateBranchInput,
  type UpdateBranchInput,
} from "@/lib/validations/branch";
import type { Branch } from "@/lib/types/branch";

interface BranchFormProps {
  branch?: Branch;
  onSubmit: (data: CreateBranchInput | UpdateBranchInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BranchForm({
  branch,
  onSubmit,
  onCancel,
  isLoading,
}: BranchFormProps) {
  const t = useTranslations("Branches");

  const { createBranchSchema } = useMemo(() => getBranchSchemas(t), [t]);

  const form = useForm({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: branch?.name || "",
      code: branch?.code || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      active: branch?.active ?? true,
      isDefault: (branch as any)?.isDefault ?? false,
    },
  });

  const handleSubmit = async (data: CreateBranchInput) => {
    try {
      if (branch) {
        await onSubmit({ ...data, id: branch.id } as UpdateBranchInput);
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("namePlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("code")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("codePlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("codeDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("address")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("addressPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phone")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("phonePlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("active")}</FormLabel>
                <FormDescription>{t("activeDescription")}</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("isDefault")}</FormLabel>
                <FormDescription>{t("isDefaultDescription")}</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {branch ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
