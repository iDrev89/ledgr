"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, RotateCcw, AlertCircle, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import type { CreateSaleInput, UpdateSaleInput } from "@/lib/validations/sales";
import { CustomerSelector } from "./customer-selector";
import { UserSelector } from "./user-selector";
import { SaleItems, type SaleItemRow } from "./sale-items";
import { SalePayments, type SalePaymentRow } from "./sale-payments";
import type { SaleWithDetails } from "@/lib/types/sales";
import { useSession } from "@/auth/auth-client";
import { useActiveBranch } from "@/hooks/use-active-branch";

interface SaleFormProps {
  sale?: SaleWithDetails;
  onSubmit: (data: CreateSaleInput | UpdateSaleInput, isDraft?: boolean) => Promise<void>;
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
  const { data: session } = useSession();
  const { activeBranchId } = useActiveBranch();
  const isAdmin = session?.user?.role === "admin";
  const isEdit = !!sale;
  const isDraftSale = sale?.status === "DRAFT";

  // State for "leave open" toggle (only for new sales)
  const [leaveOpen, setLeaveOpen] = useState(false);

  // State for calendar popover
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize items state
  const [items, setItems] = useState<SaleItemRow[]>(() => {
    if (sale?.items) {
      return sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productType: item.product.type,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        discount: item.discount.toString(),
        lineTotal:
          parseFloat(item.unitPrice.toString()) * item.quantity -
          parseFloat(item.discount.toString()),
        performedById: item.performedById || undefined,
        performedByName: item.performedBy?.name || undefined,
      }));
    }
    return [];
  });

  // Initialize payments state
  const [payments, setPayments] = useState<SalePaymentRow[]>(() => {
    if (sale?.payments) {
      return sale.payments.map((payment) => ({
        tempId: payment.id,
        amount: payment.amount.toString(),
        method: payment.method,
        bankId: payment.bankId || "",
        reference: payment.reference || "",
        attachmentUrl: (payment as any).attachmentUrl || "",
      }));
    }
    return [];
  });

  // Track if user has attempted to submit
  const [attempted, setAttempted] = useState(false);

  // Simplified form without resolver for items and payments validation
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      customerId: sale?.customerId || "",
      soldById: sale?.soldById || "",
      branchId: sale?.branchId || activeBranchId || "",
      customDate: sale?.createdAt ? format(new Date(sale.createdAt), "yyyy-MM-dd") : "",
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
        performedById: item.performedById || undefined,
      }));

      // Validate payments - all payments must have an amount
      if (payments.length > 0) {
        const hasEmptyPayments = payments.some(
          (payment) => !payment.amount || payment.amount.trim() === "",
        );
        if (hasEmptyPayments) {
          toast.error(t("validation.paymentAmountRequired"));
          return;
        }
      }

      // Map payments to the correct format
      const formattedPayments = payments.map((payment) => ({
        amount: payment.amount,
        method: payment.method,
        bankId: payment.bankId || undefined,
        reference: payment.reference || undefined,
        attachmentUrl: payment.attachmentUrl || undefined,
      }));

      const submitData: CreateSaleInput = {
        customerId: data.customerId,
        soldById: data.soldById || undefined,
        branchId: data.branchId || null,
        customDate: data.customDate || undefined,
        note: data.note || "",
        items: formattedItems,
        payments: formattedPayments,
      };

      if (sale) {
        await onSubmit({ ...submitData, id: sale.id } as UpdateSaleInput, isDraftSale);
      } else {
        await onSubmit(submitData, leaveOpen);
      }

      // Reset form on successful creation (not update)
      if (!sale) {
        handleReset();
        setLeaveOpen(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // The error will be handled by the parent component
    }
  };

  const handleReset = () => {
    form.reset({
      customerId: "",
      soldById: "",
      branchId: activeBranchId || "",
      customDate: "",
      note: "",
    });
    setItems([]);
    setPayments([]);
    setAttempted(false);
    setTouchedCustomer(false);
    setTouchedItems(false);
  };

  // Calculate totals
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalPaid = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0,
  );
  const balance = total - totalPaid;

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-28 md:pb-0">
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

          {/* Campo de vendedor - solo visible para admin */}
          {isAdmin && (
            <FormField
              control={form.control}
              name="soldById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("soldBy")}</FormLabel>
                  <FormControl>
                    <UserSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                      placeholder={t("selectSeller")}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {t("soldByDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Campo de fecha personalizada - solo visible para admin */}
          {isAdmin && (
            <FormField
              control={form.control}
              name="customDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("saleDate")}</FormLabel>
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
                            format(parse(String(field.value), "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
                          ) : (
                            <span>{t("saleDatePlaceholder")}</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parse(String(field.value), "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(date) => {
                          field.onChange(
                            date ? format(date, "yyyy-MM-dd") : "",
                          );
                          setCalendarOpen(false);
                        }}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs">
                    {t("saleDateDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <SaleItems
          items={items}
          onItemsChange={setItems}
          disabled={isLoading}
        />

        <SalePayments
          payments={payments}
          onPaymentsChange={setPayments}
          total={total}
          disabled={isLoading}
        />

        {/* Leave Open Toggle - Only for new sales */}
        {!isEdit && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <label
                htmlFor="leave-open"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("leaveOpen")}
              </label>
              <p className="text-sm text-muted-foreground">
                {t("leaveOpenDescription")}
              </p>
            </div>
            <Switch
              id="leave-open"
              checked={leaveOpen}
              onCheckedChange={setLeaveOpen}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Warning for editing completed sales */}
        {isEdit && sale?.status === "COMPLETED" && !isAdmin && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("errors.cannotEditCompletedSale")}
            </AlertDescription>
          </Alert>
        )}

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
          {attempted &&
            !isFormValid &&
            ((touchedCustomer && !customerId) ||
              (touchedItems && (!hasItems || !allItemsHaveProducts))) && (
              <div className="text-sm space-y-1 rounded-md border border-l-2 border-l-warning px-4 py-3">
                <p className="font-medium mb-2">
                  {t("validation.requiredFields")}:
                </p>
                {/* Only show customer error if user tried to submit and customer is still empty */}
                {touchedCustomer && !customerId && (
                  <p className="text-muted-foreground">
                    • {t("validation.customerIdRequired")}
                  </p>
                )}
                {/* Only show items error if user tried to submit and there are no items */}
                {touchedItems && !hasItems && (
                  <p className="text-muted-foreground">
                    • {t("validation.itemsMin")}
                  </p>
                )}
                {/* Only show product error if user tried to submit and items exist but some don't have products */}
                {touchedItems && hasItems && !allItemsHaveProducts && (
                  <p className="text-muted-foreground">
                    • {t("validation.productIdRequired")}
                  </p>
                )}
              </div>
            )}

          <div className="hidden md:flex md:flex-row md:justify-end gap-3">
            {!sale && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
              >
                {t("cancel")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {sale ? t("updateSale") : t("createSale")}
            </Button>
          </div>
        </div>
        {/* Sticky footer — mobile only */}
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4 md:hidden">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("balance")}</p>
            <p
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                balance > 0
                  ? "text-warning"
                  : balance < 0
                    ? "text-destructive"
                    : "text-success",
              )}
            >
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(balance)}
            </p>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="h-11 shrink-0"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {sale ? t("updateSale") : t("createSale")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
