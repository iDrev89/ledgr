"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState, useEffect } from "react";
import { format, parse, isValid, isAfter, startOfDay } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { parseDateOnly, formatDateOnly } from "@/lib/date-utils";
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

// Helper to format input as DD/MM/YYYY while typing
function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  let formatted = "";

  if (digits.length > 0) {
    formatted = digits.slice(0, 2);
  }
  if (digits.length > 2) {
    formatted += "/" + digits.slice(2, 4);
  }
  if (digits.length > 4) {
    formatted += "/" + digits.slice(4, 8);
  }

  return formatted;
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const t = useTranslations("Customers");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize birthdate from customer data
  const initialBirthdate = useMemo(() => {
    return parseDateOnly(customer?.birthdate);
  }, [customer?.birthdate]);

  const [birthdate, setBirthdate] = useState<Date | undefined>(
    initialBirthdate,
  );
  const [birthdateInput, setBirthdateInput] = useState(
    initialBirthdate ? format(initialBirthdate, "dd/MM/yyyy") : "",
  );

  const { createCustomerSchema } = useMemo(() => getCustomerSchemas(t), [t]);

  // Sync birthdate state when customer changes
  useEffect(() => {
    setBirthdate(initialBirthdate);
    setBirthdateInput(
      initialBirthdate ? format(initialBirthdate, "dd/MM/yyyy") : "",
    );
  }, [initialBirthdate]);

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      docId: customer?.docId || "",
      birthdate: initialBirthdate ? formatDateOnly(initialBirthdate) : "",
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

  // Handle text input change for birthdate
  const handleBirthdateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formatted = formatDateInput(e.target.value);
    setBirthdateInput(formatted);

    if (formatted.length === 0) {
      setBirthdate(undefined);
      form.setValue("birthdate", "", { shouldValidate: true });
      return;
    }

    if (formatted.length === 10) {
      const parsed = parse(formatted, "dd/MM/yyyy", new Date());
      const today = startOfDay(new Date());

      if (!isValid(parsed) || parsed.getFullYear() < 1900) {
        setBirthdate(undefined);
        // Set invalid value to ensure form is invalid
        form.setValue("birthdate", "invalid");
        form.setError("birthdate", {
          type: "manual",
          message: t("validation.birthdateInvalid"),
        });
      } else if (isAfter(parsed, today)) {
        setBirthdate(undefined);
        form.setValue("birthdate", "invalid");
        form.setError("birthdate", {
          type: "manual",
          message: t("validation.birthdateNotToday"),
        });
      } else {
        setBirthdate(parsed);
        form.setValue("birthdate", formatDateOnly(parsed), {
          shouldValidate: true,
        });
        form.clearErrors("birthdate");
      }
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setBirthdate(date);
      setBirthdateInput(format(date, "dd/MM/yyyy"));
      form.setValue("birthdate", formatDateOnly(date), {
        shouldValidate: true,
      });
    } else {
      setBirthdate(undefined);
      setBirthdateInput("");
      form.setValue("birthdate", "", { shouldValidate: true });
    }
    setCalendarOpen(false);
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
                  className="h-11 text-base"
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
                  inputMode="email"
                  placeholder={t("emailPlaceholder")}
                  disabled={isLoading}
                  className="h-11 text-base"
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
                  type="tel"
                  inputMode="tel"
                  placeholder={t("phonePlaceholder")}
                  disabled={isLoading}
                  className="h-11 text-base"
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
                  className="h-11 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={() => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("birthdate")}</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    value={birthdateInput}
                    onChange={handleBirthdateInputChange}
                    placeholder="DD/MM/YYYY"
                    disabled={isLoading}
                    maxLength={10}
                    inputMode="numeric"
                    className="flex-1 h-11"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                  className="h-11 w-11 shrink-0"
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
              {/* Calendar as bottom drawer — vaul, swipe-to-dismiss, keyboard-safe on mobile */}
              <Drawer open={calendarOpen} onOpenChange={setCalendarOpen} shouldScaleBackground={false}>
                <DrawerContent className="flex flex-col">
                  <div className="shrink-0 px-4 pb-2">
                    <DrawerHeader className="p-0 pt-1 text-left">
                      <DrawerTitle>{t("birthdate")}</DrawerTitle>
                    </DrawerHeader>
                  </div>
                  <div className="flex justify-center px-4 pb-8">
                    <Calendar
                      mode="single"
                      selected={birthdate}
                      defaultMonth={birthdate || new Date()}
                      captionLayout="dropdown"
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date()}
                      onSelect={handleCalendarSelect}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
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

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 flex-1"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {customer ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
