"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { PurchaseItems } from "./purchase-items";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useAccounts } from "@/hooks/use-accounts";
import { PaymentMethod } from "@/prisma/prisma-client";
import { getDefaultAccountForMethod, getAccountTypeLabel } from "@/lib/payment-utils";
import { useActiveBranch } from "@/hooks/use-active-branch";
import type { PurchaseItem, CreatePurchaseInput } from "@/lib/types/purchases";

interface PurchaseFormProps {
  onSubmit: (data: CreatePurchaseInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PurchaseForm({
  onSubmit,
  onCancel,
  isLoading,
}: PurchaseFormProps) {
  const t = useTranslations("Purchases");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [taxTotal, setTaxTotal] = useState<number>(0);
  const { activeBranchId } = useActiveBranch();

  const { data: suppliersData } = useSuppliers({
    active: true,
  });
  const suppliers = suppliersData?.suppliers || [];

  const { data: accountsData } = useAccounts({ activeOnly: true });
  const accounts = accountsData?.accounts || [];

  const form = useForm<any>({
    mode: "onChange",
    defaultValues: {
      supplierId: "",
      branchId: activeBranchId || "",
      invoiceNo: "",
      note: "",
      paymentMethod: "CASH" as PaymentMethod,
      accountId: "",
      reference: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod") as PaymentMethod;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + taxTotal;

  const handleFormSubmit = async (data: any) => {
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

    // Prepare purchase data
    const purchaseData: CreatePurchaseInput = {
      supplierId: data.supplierId || undefined,
      branchId: data.branchId || null,
      invoiceNo: data.invoiceNo || undefined,
      note: data.note || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        lineTotal: item.lineTotal,
      })),
      taxTotal,

      // Campos de pago
      paymentMethod: data.paymentMethod,
      accountId: data.accountId || undefined,
      reference: data.reference || undefined,
    };

    await onSubmit(purchaseData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* General Information */}
        <div className="space-y-4">
          {/* Supplier */}
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("supplierOptional")}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? "" : value);
                  }}
                  value={field.value || "none"}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectSupplier")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{t("noSupplier")}</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice No */}
          <FormField
            control={form.control}
            name="invoiceNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("invoiceNo")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("invoiceNoPlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t("notesPlaceholder")}
                    rows={3}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Items */}
        <PurchaseItems
          items={items}
          onItemsChange={setItems}
          disabled={isLoading}
        />

        <Separator />

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">{t("paymentInformation")}</h3>

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("paymentMethod")}</FormLabel>
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
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                      {t("paymentBankTransfer")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cuenta destino */}
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("destinationAccount")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectAccount")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                        {account.accountNumber && ` - ${account.accountNumber}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reference */}
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("reference")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("referencePlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-4">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="text-lg font-semibold">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Taxes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("taxes")}</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={taxTotal}
              onChange={(e) => setTaxTotal(parseFloat(e.target.value) || 0)}
              placeholder="0"
              disabled={isLoading}
            />
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">{t("total")}</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || items.length === 0}
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("createPurchase")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
