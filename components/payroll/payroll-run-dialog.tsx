"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, ChevronDownIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPayrollSchemas, type CreatePayrollRunInput } from "@/lib/validations/payroll";
import { PayrollPeriodType } from "@/prisma/prisma-client";

interface PayrollRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePayrollRunInput & { userIds?: string[] }) => Promise<void>;
  isLoading?: boolean;
}

export function PayrollRunDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PayrollRunDialogProps) {
  const t = useTranslations("Payroll");
  const { createPayrollRunSchema } = getPayrollSchemas(t);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const form = useForm<CreatePayrollRunInput>({
    resolver: zodResolver(createPayrollRunSchema),
    defaultValues: {
      periodType: PayrollPeriodType.BIWEEKLY,
      periodLabel: "",
      startDate: "",
      endDate: "",
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setStartDateOpen(false);
      setEndDateOpen(false);
    }
  }, [open, form]);

  const handleSubmit = async (data: CreatePayrollRunInput) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createRun")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="periodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("periodType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PayrollPeriodType.DAILY}>
                        {t("periodTypeDaily")}
                      </SelectItem>
                      <SelectItem value={PayrollPeriodType.BIWEEKLY}>
                        {t("periodTypeBiweekly")}
                      </SelectItem>
                      <SelectItem value={PayrollPeriodType.CUSTOM}>
                        {t("periodTypeCustom")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("periodLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("periodLabelPlaceholder")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("startDate")}</FormLabel>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(new Date(field.value), "dd/MM/yyyy", {
                                locale: es,
                              })
                            ) : (
                              <span>{t("startDate")}</span>
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
                          selected={field.value ? new Date(field.value) : undefined}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : ""
                            );
                            setStartDateOpen(false);
                          }}
                          disabled={(date) =>
                            date < new Date("2020-01-01") ||
                            date > new Date("2100-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("endDate")}</FormLabel>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(new Date(field.value), "dd/MM/yyyy", {
                                locale: es,
                              })
                            ) : (
                              <span>{t("endDate")}</span>
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
                          selected={field.value ? new Date(field.value) : undefined}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : ""
                            );
                            setEndDateOpen(false);
                          }}
                          disabled={(date) =>
                            date < new Date("2020-01-01") ||
                            date > new Date("2100-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

