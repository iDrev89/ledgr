"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  getBusinessLineSchemas,
  type CreateBusinessLineInput,
  type UpdateBusinessLineInput,
} from "@/lib/validations/business-line";
import type { BusinessLine } from "@/lib/types/business-line";

interface BusinessLineFormProps {
  businessLine?: BusinessLine;
  onSubmit: (
    data: CreateBusinessLineInput | UpdateBusinessLineInput,
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const COLOR_OPTIONS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
];

export function BusinessLineForm({
  businessLine,
  onSubmit,
  onCancel,
  isLoading,
}: BusinessLineFormProps) {
  const t = useTranslations("BusinessLines");

  const { createBusinessLineSchema } = useMemo(
    () => getBusinessLineSchemas(t),
    [t],
  );

  const form = useForm<CreateBusinessLineInput>({
    resolver: zodResolver(createBusinessLineSchema),
    defaultValues: {
      name: businessLine?.name || "",
      code: businessLine?.code || "",
      color: businessLine?.color || "",
      active: businessLine?.active ?? true,
    },
  });

  const handleSubmit = async (data: CreateBusinessLineInput) => {
    try {
      if (businessLine) {
        await onSubmit({
          ...data,
          id: businessLine.id,
        } as UpdateBusinessLineInput);
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const selectedColor = form.watch("color");

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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("code")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("codePlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("color")}</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        selectedColor === option.value
                          ? "border-foreground scale-110"
                          : "border-transparent hover:border-muted-foreground/50"
                      }`}
                      style={{ backgroundColor: option.value }}
                      onClick={() => field.onChange(option.value)}
                      disabled={isLoading}
                      aria-label={option.label}
                      tabIndex={0}
                    />
                  ))}
                  {selectedColor && (
                    <button
                      type="button"
                      className="h-8 px-2 rounded-full border border-dashed border-muted-foreground/50 text-xs text-muted-foreground hover:bg-muted transition-colors"
                      onClick={() => field.onChange("")}
                      disabled={isLoading}
                      tabIndex={0}
                      aria-label="Clear color"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("active")}</FormLabel>
                <FormDescription>{t("activeDescription")}</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {businessLine ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
