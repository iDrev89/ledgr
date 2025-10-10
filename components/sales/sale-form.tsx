"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Loader2, RotateCcw } from "lucide-react";
import type {
  CreateSaleInput,
  UpdateSaleInput,
} from "@/lib/validations/sales";
import { CustomerSelector } from "./customer-selector";
import { SaleItemsTable, type SaleItemRow } from "./sale-items-table";
import { PaymentMethod } from "@/prisma/prisma-client";
import type { SaleWithDetails } from "@/lib/types/sales";

interface SaleFormProps {
  sale?: SaleWithDetails;
  onSubmit: (data: CreateSaleInput | UpdateSaleInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SaleForm({
  sale,
  onSubmit,
  onCancel,
  isLoading,
}: SaleFormProps) {
  const t = useTranslations("Sales");

  // Initialize items state
  const [items, setItems] = useState<SaleItemRow[]>(() => {
    if (sale?.items) {
      return sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        discount: item.discount.toString(),
        lineTotal:
          parseFloat(item.unitPrice.toString()) * item.quantity -
          parseFloat(item.discount.toString()),
      }));
    }
    return [];
  });

  // Track if user has attempted to submit
  const [attempted, setAttempted] = useState(false);

  // Simplified form without resolver for items validation
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      customerId: sale?.customerId || "",
      paymentMethod: sale?.paymentMethod || PaymentMethod.CASH,
      note: sale?.note || "",
    },
  });

  const handleSubmit = async (data: any) => {
    // Mark as attempted
    setAttempted(true);
    setTouchedCustomer(true);
    setTouchedItems(true);

    try {
      // Validate customer
      if (!data.customerId) {
        toast.error(t("validation.customerIdRequired"));
        return;
      }

      // Validate items
      if (items.length === 0) {
        toast.error(t("validation.itemsMin"));
        return;
      }

      const hasInvalidItems = items.some((item) => !item.productId);
      if (hasInvalidItems) {
        toast.error(t("validation.productIdRequired"));
        return;
      }

      // Map items to the correct format
      const formattedItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || "0",
      }));

      const submitData: CreateSaleInput = {
        customerId: data.customerId,
        paymentMethod: data.paymentMethod,
        note: data.note || "",
        items: formattedItems,
      };

      if (sale) {
        await onSubmit({ ...submitData, id: sale.id } as UpdateSaleInput);
      } else {
        await onSubmit(submitData);
      }

      // Reset form on successful creation (not update)
      if (!sale) {
        handleReset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // The error will be handled by the parent component
    }
  };

  const handleReset = () => {
    form.reset({
      customerId: "",
      paymentMethod: PaymentMethod.CASH,
      note: "",
    });
    setItems([]);
    setAttempted(false);
    setTouchedCustomer(false);
    setTouchedItems(false);
  };

  // Check if form is valid for better UX
  const customerId = form.watch("customerId");
  const hasItems = items.length > 0;
  const allItemsHaveProducts = items.every((item) => item.productId);
  const isFormValid = customerId && hasItems && allItemsHaveProducts;

  // Track which validations should be shown based on what user has interacted with
  const [touchedCustomer, setTouchedCustomer] = useState(false);
  const [touchedItems, setTouchedItems] = useState(false);

  // Reset attempted state when form becomes valid
  useEffect(() => {
    if (isFormValid && attempted) {
      setAttempted(false);
      setTouchedCustomer(false);
      setTouchedItems(false);
    }
  }, [isFormValid, attempted]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customer")}</FormLabel>
                <FormControl>
                  <CustomerSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("paymentMethod")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectPaymentMethod")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>
                      {t("paymentCash")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.CARD}>
                      {t("paymentCard")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.TRANSFER}>
                      {t("paymentTransfer")}
                    </SelectItem>
                    <SelectItem value={PaymentMethod.DIGITAL}>
                      {t("paymentDigital")}
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
        </div>

        <SaleItemsTable
          items={items}
          onItemsChange={setItems}
          disabled={isLoading}
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
                  rows={2}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {t("noteDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          {/* Validation hints - show each error independently based on what was touched */}
          {attempted && !isFormValid && 
            ((touchedCustomer && !customerId) || 
             (touchedItems && (!hasItems || !allItemsHaveProducts))) && (
            <div className="text-sm space-y-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                {t("validation.requiredFields")}:
              </p>
              {/* Only show customer error if user tried to submit and customer is still empty */}
              {touchedCustomer && !customerId && (
                <p className="text-amber-700 dark:text-amber-300">
                  • {t("validation.customerIdRequired")}
                </p>
              )}
              {/* Only show items error if user tried to submit and there are no items */}
              {touchedItems && !hasItems && (
                <p className="text-amber-700 dark:text-amber-300">
                  • {t("validation.itemsMin")}
                </p>
              )}
              {/* Only show product error if user tried to submit and items exist but some don't have products */}
              {touchedItems && hasItems && !allItemsHaveProducts && (
                <p className="text-amber-700 dark:text-amber-300">
                  • {t("validation.productIdRequired")}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!sale && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("reset")}
              </Button>
            )}
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {sale ? t("updateSale") : t("createSale")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

