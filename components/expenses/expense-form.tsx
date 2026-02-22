"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { format, parseISO, isValid } from "date-fns";
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
import { useAccounts } from "@/hooks/use-accounts";
import { getDefaultAccountForMethod, getAccountTypeLabel } from "@/lib/payment-utils";
import { cn } from "@/lib/utils";
import { AttachmentUpload } from "@/components/shared/attachment-upload";
import { BusinessLineSelector } from "@/components/ui/business-line-selector";
import { PaymentMethod } from "@/prisma/prisma-client";
import { useActiveBranch } from "@/hooks/use-active-branch";

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
  const tAccounts = useTranslations("Accounts");
  const { data } = useAccounts({ activeOnly: true });
  const accounts = data?.accounts || [];
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { activeBranchId } = useActiveBranch();

  const { createExpenseSchema } = useMemo(() => getExpenseSchemas(t), [t]);

  // Helper to parse datetime from backend
  const parseDateTime = (
    value: string | Date | undefined,
  ): Date | undefined => {
    if (!value) return undefined;
    try {
      if (value instanceof Date) return value;
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  };

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      categoryId: expense?.categoryId || "",
      supplierId: expense?.supplierId || undefined,
      branchId: expense?.branchId || activeBranchId || null,
      businessLineId: expense?.businessLineId || null,
      description: expense?.description || "",
      invoiceNo: expense?.invoiceNo || "",
      amount: expense?.amount ? expense.amount.toString() : "",
      paymentMethod: (expense as any)?.paymentMethod || PaymentMethod.CASH,
      accountId: (expense as any)?.accountId || undefined,
      reference: (expense as any)?.reference || "",
      incurredAt: expense?.incurredAt
        ? typeof expense.incurredAt === "string"
          ? expense.incurredAt
          : expense.incurredAt.toISOString()
        : new Date().toISOString(),
      attachment: expense?.attachment || null,
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
              <FormLabel>{t("descriptionLabel")}</FormLabel>
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
          <FormField
            control={form.control}
            name="businessLineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("businessLine")}</FormLabel>
                <FormControl>
                  <BusinessLineSelector
                    value={field.value || null}
                    onValueChange={(val) => field.onChange(val)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex flex-col">
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
                          (() => {
                            const date = parseDateTime(field.value);
                            return date
                              ? format(date, "dd/MM/yyyy")
                              : t("datePlaceholder");
                          })()
                        ) : (
                          <span>{t("datePlaceholder")}</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={parseDateTime(field.value)}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString() : "");
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("paymentMethod")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("paymentMethodPlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>
                      {t("paymentCash")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.DEBIT_CARD}>
                      {t("paymentDebitCard")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT_CARD}>
                      {t("paymentCreditCard")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                      {t("paymentBankTransfer")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.DIGITAL_PAYMENT}>
                      {t("paymentDigitalPayment")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.CHECK}>
                      {t("paymentCheck")}
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
        </div>

        {/* Account and Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account */}
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("destinationAccount")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("accountPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({getAccountTypeLabel(account.type, tAccounts)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reference (all methods except CASH) */}
          {paymentMethod !== PaymentMethod.CASH && (
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
                  <FormDescription>
                    {t("referenceDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Attachment */}
        <FormField
          control={form.control}
          name="attachment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("attachmentLabel")}</FormLabel>
              <FormControl>
                <AttachmentUpload
                  currentUrl={field.value}
                  onUploadComplete={field.onChange}
                  disabled={isLoading}
                  folder="expenses"
                  label={t("attachmentPlaceholder")}
                />
              </FormControl>
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
