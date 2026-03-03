"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useEffect } from "react";
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
  getStockMovementSchemas,
  type CreateStockMovementInput,
} from "@/lib/validations/inventory";
import { StockMoveType } from "@/prisma/prisma-client";
import { useProducts } from "@/hooks/use-products";
import { BranchSelector } from "@/components/ui/branch-selector";

interface StockMovementFormProps {
  productId?: string;
  branchId?: string;
  onSubmit: (data: CreateStockMovementInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StockMovementForm({
  productId,
  branchId,
  onSubmit,
  onCancel,
  isLoading,
}: StockMovementFormProps) {
  const t = useTranslations("Inventory");
  const { data: productsData } = useProducts({ active: true });

  const { createStockMovementSchema } = useMemo(
    () => getStockMovementSchemas(t),
    [t],
  );

  const form = useForm<CreateStockMovementInput>({
    resolver: zodResolver(createStockMovementSchema),
    defaultValues: {
      productId: productId || "",
      branchId: branchId || "",
      moveType: StockMoveType.ADJUSTMENT,
      quantity: 0,
      unitCost: "",
      note: "",
    },
  });

  // Set productId if provided
  useEffect(() => {
    if (productId) {
      form.setValue("productId", productId);
    }
  }, [productId, form]);

  const handleSubmit = async (data: CreateStockMovementInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("product")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || !!productId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectProduct")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productsData?.products
                    .filter((p) => p.type === "PRODUCT")
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} {product.sku ? `(${product.sku})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("branch")}</FormLabel>
              <FormControl>
                <BranchSelector
                  value={field.value || null}
                  onValueChange={(val) => field.onChange(val || "")}
                  disabled={isLoading}
                  allowNone={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moveType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("moveType")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectMoveType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={StockMoveType.PURCHASE}>
                    {t("movePurchase")}
                  </SelectItem>
                  <SelectItem value={StockMoveType.SALE}>
                    {t("moveSale")}
                  </SelectItem>
                  <SelectItem value={StockMoveType.ADJUSTMENT}>
                    {t("moveAdjustment")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                {t("moveTypeDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("quantity")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder={t("quantityPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("quantityDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("unitCost")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("unitCostPlaceholder")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("unitCostDescription")}
              </FormDescription>
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
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
