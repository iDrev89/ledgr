"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  getBankTransactionSchemas,
  type CreateTransactionInput,
} from "@/lib/validations/bank-transactions";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { useBanks } from "@/hooks/use-banks";

enum BankTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUSTMENT = "ADJUSTMENT",
}

interface TransactionFormProps {
  transaction?: BankTransactionWithRelations;
  defaultBankId?: string;
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  isSubmitting: boolean;
}

export const TransactionForm = ({
  transaction,
  defaultBankId,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) => {
  const t = useTranslations("BankTransactions");
  const { data } = useBanks();
  const banks = data?.banks || [];
  const { createTransactionSchema } = getBankTransactionSchemas(t);

  const form = useForm({
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      bankId: transaction?.bankId || defaultBankId || "",
      type: transaction?.type || BankTransactionType.ADJUSTMENT,
      amount: transaction?.amount ? transaction.amount.toString() : "",
      description: transaction?.description || "",
      reference: transaction?.reference || "",
      transactionDate: transaction?.transactionDate || new Date(),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <FormField
          control={form.control}
          name="bankId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("bank")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting || !!defaultBankId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("bankPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("type")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("typePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={BankTransactionType.INCOME}>
                    {t("typeIncome")}
                  </SelectItem>
                  <SelectItem value={BankTransactionType.EXPENSE}>
                    {t("typeExpense")}
                  </SelectItem>
                  <SelectItem value={BankTransactionType.ADJUSTMENT}>
                    {t("typeAdjustment")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                {t("typeDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("amount")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder={t("amountPlaceholder")}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("amountDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("transactionDate")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="datetime-local"
                  value={
                    field.value
                      ? new Date(field.value).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("descriptionLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("descriptionPlaceholder")}
                  disabled={isSubmitting}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("reference")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("referencePlaceholder")}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("referenceDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transaction
              ? isSubmitting
                ? t("updating")
                : t("update")
              : isSubmitting
              ? t("creating")
              : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

