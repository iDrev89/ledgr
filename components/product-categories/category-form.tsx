"use client";

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
import { Switch } from "@/components/ui/switch";
import {
  getProductCategorySchemas,
  type CreateProductCategoryInput,
} from "@/lib/validations/product-categories";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";

interface CategoryFormProps {
  category?: ProductCategoryWithRelations;
  onSubmit: (data: CreateProductCategoryInput) => Promise<void>;
  isSubmitting: boolean;
}

export const CategoryForm = ({
  category,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) => {
  const t = useTranslations("ProductCategories");
  const { createProductCategorySchema } = getProductCategorySchemas(t);

  const form = useForm<CreateProductCategoryInput>({
    resolver: zodResolver(createProductCategorySchema),
    defaultValues: {
      name: category?.name || "",
      active: category?.active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("namePlaceholder")}
                  {...field}
                  disabled={isSubmitting}
                />
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
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category
              ? isSubmitting
                ? t("updating")
                : t("update")
              : isSubmitting
              ? t("creating")
              : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

