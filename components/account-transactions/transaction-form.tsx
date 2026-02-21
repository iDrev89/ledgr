"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  getAccountTransactionSchemas,
  type CreateTransactionInput,
} from "@/lib/validations/account-transactions";
import type { AccountTransactionWithRelations } from "@/lib/types/account-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { cn } from "@/lib/utils";

enum AccountTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUSTMENT = "ADJUSTMENT",
}

interface TransactionFormProps {
  transaction?: AccountTransactionWithRelations;
  defaultAccountId?: string;
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  isSubmitting: boolean;
}

export const TransactionForm = ({
  transaction,
  defaultAccountId,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) => {
  const t = useTranslations("AccountTransactions");
  const { data } = useAccounts();
  const accounts = data?.accounts || [];
  const { createTransactionSchema } = getAccountTransactionSchemas(t);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      accountId: transaction?.accountId || defaultAccountId || "",
      type: transaction?.type || AccountTransactionType.ADJUSTMENT,
      amount: transaction?.amount ? transaction.amount.toString() : "",
      description: transaction?.description || "",
      reference: transaction?.reference || "",
      transactionDate: transaction?.transactionDate 
        ? String(transaction.transactionDate).includes("T")
          ? String(transaction.transactionDate).slice(0, 16)
          : format(new Date(String(transaction.transactionDate)), "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("account")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting || !!defaultAccountId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("accountPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
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
                  <SelectItem value={AccountTransactionType.INCOME}>
                    {t("typeIncome")}
                  </SelectItem>
                  <SelectItem value={AccountTransactionType.EXPENSE}>
                    {t("typeExpense")}
                  </SelectItem>
                  <SelectItem value={AccountTransactionType.ADJUSTMENT}>
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
            <FormItem className="flex flex-col">
              <FormLabel>{t("transactionDate")}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(parseISO(String(field.value).split("T")[0]), "dd/MM/yyyy")
                      ) : (
                        <span>{t("transactionDatePlaceholder")}</span>
                      )}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(String(field.value).split("T")[0]) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const currentTime = field.value 
                          ? String(field.value).split("T")[1] || "12:00"
                          : "12:00";
                        field.onChange(format(date, "yyyy-MM-dd") + "T" + currentTime);
                      }
                      setCalendarOpen(false);
                    }}
                    disabled={isSubmitting}
                  />
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <Input
                  type="time"
                  value={field.value ? String(field.value).split("T")[1] || "" : ""}
                  onChange={(e) => {
                    const currentDate = field.value
                      ? String(field.value).split("T")[0]
                      : format(new Date(), "yyyy-MM-dd");
                    field.onChange(currentDate + "T" + e.target.value);
                  }}
                  disabled={isSubmitting}
                />
              </div>
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
