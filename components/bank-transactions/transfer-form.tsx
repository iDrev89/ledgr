"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, ArrowRight } from "lucide-react";
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
  type CreateTransferInput,
} from "@/lib/validations/bank-transactions";
import { useBanks } from "@/hooks/use-banks";

interface TransferFormProps {
  onSubmit: (data: CreateTransferInput) => Promise<void>;
  isSubmitting: boolean;
}

export const TransferForm = ({ onSubmit, isSubmitting }: TransferFormProps) => {
  const t = useTranslations("BankTransactions");
  const { data } = useBanks();
  const banks = data?.banks || [];
  const { createTransferSchema } = getBankTransactionSchemas(t);

  const form = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      fromBankId: "",
      toBankId: "",
      amount: "",
      description: "",
      reference: "",
      transactionDate: new Date(),
    },
  });

  const fromBankId = form.watch("fromBankId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fromBankId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fromBank")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fromBankPlaceholder")} />
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
            name="toBankId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("toBank")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("toBankPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks
                      .filter((bank) => bank.id !== fromBankId)
                      .map((bank) => (
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
        </div>

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
                {t("transferAmountDescription")}
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
                  placeholder={t("transferDescriptionPlaceholder")}
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
            {!isSubmitting && <ArrowRight className="mr-2 h-4 w-4" />}
            {isSubmitting ? t("creating") : t("createTransfer")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
