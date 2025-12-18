"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { Loader2, ArrowRight, ChevronDownIcon, CalendarIcon } from "lucide-react";
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
  getBankTransactionSchemas,
  type CreateTransferInput,
} from "@/lib/validations/bank-transactions";
import { useBanks } from "@/hooks/use-banks";
import { cn } from "@/lib/utils";

interface TransferFormProps {
  onSubmit: (data: CreateTransferInput) => Promise<void>;
  isSubmitting: boolean;
}

export const TransferForm = ({ onSubmit, isSubmitting }: TransferFormProps) => {
  const t = useTranslations("BankTransactions");
  const { data } = useBanks();
  const banks = data?.banks || [];
  const { createTransferSchema } = getBankTransactionSchemas(t);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      fromBankId: "",
      toBankId: "",
      amount: "",
      description: "",
      reference: "",
      transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
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
