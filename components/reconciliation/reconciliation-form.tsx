"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { format, parseISO, isValid } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  createReconciliationSchema,
  type CreateReconciliationInput,
} from "@/lib/validations/reconciliation";
import { useAccounts } from "@/hooks/use-accounts";
import { AccountType } from "@/prisma/prisma-client";
import { cn } from "@/lib/utils";

interface ReconciliationFormProps {
  onSubmit: (data: CreateReconciliationInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReconciliationForm({
  onSubmit,
  onCancel,
  isLoading,
}: ReconciliationFormProps) {
  const t = useTranslations("Reconciliation");
  const { data } = useAccounts({ activeOnly: true });
  const bankAccounts = (data?.accounts || []).filter(
    (a) => a.type === AccountType.BANK,
  );
  const [periodStartOpen, setPeriodStartOpen] = useState(false);
  const [periodEndOpen, setPeriodEndOpen] = useState(false);

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

  const form = useForm<CreateReconciliationInput>({
    resolver: zodResolver(createReconciliationSchema) as any,
    defaultValues: {
      accountId: "",
      periodStart: undefined as unknown as Date,
      periodEnd: undefined as unknown as Date,
      statementBalance: 0,
      notes: "",
    },
  });

  const handleSubmit = async (data: CreateReconciliationInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("account")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("accountPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bankAccounts.map((account) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="periodStart"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {t("periodStart")} <span className="text-destructive">*</span>
                </FormLabel>
                <Popover open={periodStartOpen} onOpenChange={setPeriodStartOpen}>
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
                          format(
                            field.value instanceof Date
                              ? field.value
                              : parseDateTime(field.value as unknown as string) || new Date(),
                            "dd/MM/yyyy",
                          )
                        ) : (
                          <span>{t("periodStartPlaceholder")}</span>
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
                      selected={
                        field.value instanceof Date
                          ? field.value
                          : parseDateTime(field.value as unknown as string)
                      }
                      onSelect={(date) => {
                        field.onChange(date);
                        setPeriodStartOpen(false);
                      }}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {t("periodEnd")} <span className="text-destructive">*</span>
                </FormLabel>
                <Popover open={periodEndOpen} onOpenChange={setPeriodEndOpen}>
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
                          format(
                            field.value instanceof Date
                              ? field.value
                              : parseDateTime(field.value as unknown as string) || new Date(),
                            "dd/MM/yyyy",
                          )
                        ) : (
                          <span>{t("periodEndPlaceholder")}</span>
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
                      selected={
                        field.value instanceof Date
                          ? field.value
                          : parseDateTime(field.value as unknown as string)
                      }
                      onSelect={(date) => {
                        field.onChange(date);
                        setPeriodEndOpen(false);
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

        <FormField
          control={form.control}
          name="statementBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("statementBalance")}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("notesPlaceholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
