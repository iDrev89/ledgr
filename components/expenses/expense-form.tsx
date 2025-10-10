"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
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
import {
  getExpenseSchemas,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validations/expenses";
import { CategorySelector } from "./category-selector";
import type { ExpenseWithDetails } from "@/lib/types/expenses";

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
  
  const { createExpenseSchema } = useMemo(() => getExpenseSchemas(t), [t]);

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      categoryId: expense?.categoryId || "",
      supplierId: expense?.supplierId || undefined,
      description: expense?.description || "",
      invoiceNo: expense?.invoiceNo || "",
      amount: expense?.amount ? expense.amount.toString() : "",
      incurredAt: expense?.incurredAt
        ? new Date(expense.incurredAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

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
              <FormItem>
                <FormLabel>{t("date")}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      typeof field.value === "string"
                        ? field.value.split("T")[0]
                        : new Date(field.value).toISOString().split("T")[0]
                    }
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

