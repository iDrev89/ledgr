"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getExpenseSchemas,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validations/expenses";
import { CategorySelector } from "./category-selector";
import type { ExpenseWithDetails } from "@/lib/types/expenses";
import { useBanks } from "@/hooks/use-banks";
import { cn } from "@/lib/utils";

enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  TRANSFER = "TRANSFER",
  DIGITAL = "DIGITAL",
  OTHER = "OTHER",
}

interface ExpenseFormProps {
  expense?: ExpenseWithDetails;
  onSubmit: (data: CreateExpenseInput | UpdateExpenseInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({
  expense,
  onSubmit,
  onCancel,
  isLoading,
}: ExpenseFormProps) {
  const t = useTranslations("Expenses");
  const { data } = useBanks();
  const banks = data?.banks || [];
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { createExpenseSchema } = useMemo(() => getExpenseSchemas(t), [t]);

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      categoryId: expense?.categoryId || "",
      supplierId: expense?.supplierId || undefined,
      description: expense?.description || "",
      invoiceNo: expense?.invoiceNo || "",
      amount: expense?.amount ? expense.amount.toString() : "",
      paymentMethod: (expense as any)?.paymentMethod || PaymentMethod.CASH,
      bankId: (expense as any)?.bankId || undefined,
      reference: (expense as any)?.reference || "",
      incurredAt: expense?.incurredAt
        ? String(expense.incurredAt).split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const handleSubmit = async (data: CreateExpenseInput) => {
    try {
      if (expense) {
        await onSubmit({ ...data, id: expense.id } as UpdateExpenseInput);
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("category")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <CategorySelector
                  value={field.value || undefined}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("descriptionPlaceholder")}
                  {...field}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("amount")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="incurredAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("date")}</FormLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(parseISO(String(field.value)), "dd/MM/yyyy")
                        ) : (
                          <span>{t("datePlaceholder")}</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(String(field.value)) : undefined}
                      onSelect={(date) => {
                        field.onChange(
                          date ? format(date, "yyyy-MM-dd") : "",
                        );
                        setCalendarOpen(false);
                      }}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("paymentMethod")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("paymentMethodPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>
                    {t("paymentCash")}
                  </SelectItem>
                  <SelectItem value={PaymentMethod.CARD}>
                    {t("paymentCard")}
                  </SelectItem>
                  <SelectItem value={PaymentMethod.TRANSFER}>
                    {t("paymentTransfer")}
                  </SelectItem>
                  <SelectItem value={PaymentMethod.DIGITAL}>
                    {t("paymentDigital")}
                  </SelectItem>
                  <SelectItem value={PaymentMethod.OTHER}>
                    {t("paymentOther")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bank (only for TRANSFER) */}
        {paymentMethod === PaymentMethod.TRANSFER && (
          <FormField
            control={form.control}
            name="bankId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("bank")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={isLoading}
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
        )}

        {/* Reference */}
        {paymentMethod === PaymentMethod.TRANSFER && (
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("reference")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("referencePlaceholder")}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>{t("referenceDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Invoice Number */}
        <FormField
          control={form.control}
          name="invoiceNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("invoiceNo")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("invoiceNoPlaceholder")}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>{t("invoiceNoDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {expense ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
