"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCustomerSchemas,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/lib/validations/customer";
import type { Customer } from "@/lib/types/customer";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CreateCustomerInput | UpdateCustomerInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const t = useTranslations("Customers");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { createCustomerSchema } = useMemo(() => getCustomerSchemas(t), [t]);

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      docId: customer?.docId || "",
      birthdate: customer?.birthdate
        ? new Date(customer.birthdate).toISOString().split("T")[0]
        : "",
      note: customer?.note || "",
    },
  });

  const handleSubmit = async (data: CreateCustomerInput) => {
    try {
      if (customer) {
        await onSubmit({ ...data, id: customer.id } as UpdateCustomerInput);
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phone")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("phonePlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="docId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("docId")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("docIdPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("birthdate")}</FormLabel>
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
                        format(new Date(field.value), "dd/MM/yyyy")
                      ) : (
                        <span>{t("birthdatePlaceholder")}</span>
                      )}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      field.onChange(
                        date ? date.toISOString().split("T")[0] : "",
                      );
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date >= today || date < new Date("1900-01-01");
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("note")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("notePlaceholder")}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
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
            {customer ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
