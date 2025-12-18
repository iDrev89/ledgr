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
  getBankSchemas,
  type CreateBankInput,
  type UpdateBankInput,
} from "@/lib/validations/bank";
import type { Bank } from "@/lib/types/bank";

interface BankFormProps {
  bank?: Bank;
  onSubmit: (data: CreateBankInput | UpdateBankInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BankForm({
  bank,
  onSubmit,
  onCancel,
  isLoading,
}: BankFormProps) {
  const t = useTranslations("Banks");

  const { createBankSchema } = useMemo(() => getBankSchemas(t), [t]);

  const form = useForm<CreateBankInput>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: bank?.name || "",
      accountNo: bank?.accountNo || "",
      active: bank?.active ?? true,
    },
  });

  const handleSubmit = async (data: CreateBankInput) => {
    try {
      if (bank) {
        await onSubmit({ ...data, id: bank.id } as UpdateBankInput);
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
          name="accountNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("accountNo")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("accountNoPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("accountNoDescription")}
              </FormDescription>
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
            {bank ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
