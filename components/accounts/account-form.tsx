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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  getAccountSchemas,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/validations/account";
import type { Account } from "@/lib/types/account";
import { AccountType } from "@/prisma/prisma-client";

interface AccountFormProps {
  account?: Account;
  onSubmit: (data: CreateAccountInput | UpdateAccountInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.BANK, labelKey: "typeBankLabel" },
  { value: AccountType.CASH_REGISTER, labelKey: "typeCashRegister" },
  { value: AccountType.PETTY_CASH, labelKey: "typePettyCash" },
  { value: AccountType.DIGITAL_WALLET, labelKey: "typeDigitalWallet" },
  { value: AccountType.CREDIT_LINE, labelKey: "typeCreditLine" },
] as const;

export function AccountForm({
  account,
  onSubmit,
  onCancel,
  isLoading,
}: AccountFormProps) {
  const t = useTranslations("Accounts");

  const { createAccountSchema } = useMemo(() => getAccountSchemas(t), [t]);

  const form = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: account?.name || "",
      type: account?.type || AccountType.BANK,
      accountNumber: account?.accountNumber || "",
      institution: account?.institution || "",
      initialBalance: account?.initialBalance?.toString() || "0",
      isDefault: account?.isDefault ?? false,
      active: account?.active ?? true,
    },
  });

  const handleSubmit = async (data: CreateAccountInput) => {
    try {
      if (account) {
        await onSubmit({ ...data, id: account.id } as UpdateAccountInput);
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("type")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("typePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCOUNT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("institution")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("institutionPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("institutionDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("accountNumber")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("accountNumberPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("accountNumberDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("initialBalance")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder={t("initialBalancePlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("initialBalanceDescription")}
              </FormDescription>
              <FormMessage />
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
            {account ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
