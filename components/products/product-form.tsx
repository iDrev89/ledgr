"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getProductSchemas,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/validations/product";
import type { Product } from "@/lib/types/product";
import { ProductType } from "@/prisma/prisma-client";
import { useProductCategories } from "@/hooks/use-product-categories";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductInput | UpdateProductInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const t = useTranslations("Products");
  const { data: categories = [] } = useProductCategories();

  const { createProductSchema } = useMemo(() => getProductSchemas(t), [t]);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      type: product?.type || ProductType.PRODUCT,
      sku: product?.sku || "",
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price ? product.price.toString() : "",
      cost: product?.cost ? product.cost.toString() : "",
      commissionPercent: product?.commissionPercent
        ? product.commissionPercent.toString()
        : "",
      categoryId: product?.categoryId || undefined,
      active: product?.active ?? true,
    },
  });

  const productType = form.watch("type");

  const handleSubmit = async (data: CreateProductInput) => {
    try {
      if (product) {
        await onSubmit({ ...data, id: product.id } as UpdateProductInput);
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("type")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("typePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ProductType.PRODUCT}>
                      {t("typeProduct")}
                    </SelectItem>
                    <SelectItem value={ProductType.SERVICE}>
                      {t("typeService")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sku")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("skuPlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  {t("skuDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("descriptionPlaceholder")}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("category")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("categoryPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t("pricePlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cost")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t("costPlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  {t("costDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {productType === ProductType.SERVICE && (
          <FormField
            control={form.control}
            name="commissionPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("commissionPercent")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder={t("commissionPercentPlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  {t("commissionPercentDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
            {product ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

