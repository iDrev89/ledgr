"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getReceivableSchemas } from "@/lib/validations/receivables";
import { useCreateReceivablePayment } from "@/hooks/use-receivables";
import { useAccounts } from "@/hooks/use-accounts";
import { PaymentMethod } from "@/prisma/prisma-client";
import type { ReceivableWithDetails } from "@/lib/types/receivables";

interface ReceivablePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: ReceivableWithDetails | null;
}

export function ReceivablePaymentDialog({
  open,
  onOpenChange,
  receivable,
}: ReceivablePaymentDialogProps) {
  const t = useTranslations("Receivables");
  const { receivablePaymentSchema } = getReceivableSchemas(t);
  const createPaymentMutation = useCreateReceivablePayment();
  const { data: accountsData } = useAccounts({ activeOnly: true });
  const accounts = accountsData?.accounts || [];

  const form = useForm({
    resolver: zodResolver(receivablePaymentSchema),
    defaultValues: {
      amount: "",
      method: PaymentMethod.CASH,
      accountId: "",
      note: "",
    },
  });

  const selectedMethod = form.watch("method");

  const handleSubmit = async (data: any) => {
    if (!receivable) return;

    try {
      await createPaymentMutation.mutateAsync({
        receivableId: receivable.id,
        amount: data.amount,
        method: data.method,
        accountId: data.accountId || undefined,
        note: data.note || undefined,
      });

      toast.success(t("paymentSuccess"));
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(t("paymentError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  if (!receivable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("registerPaymentTitle")}</DialogTitle>
            <DialogDescription>
              {t("registerPaymentDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("customer")}:</span>
            <span className="font-medium">{receivable.customer.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("total")}:</span>
            <span className="font-medium">
              {formatCurrency(receivable.total)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("balance")}:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {formatCurrency(receivable.balance)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentAmount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      disabled={createPaymentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentMethod")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createPaymentMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.CASH}>
                        {t("paymentCash")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.DEBIT_CARD}>
                        {t("paymentDebitCard")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CREDIT_CARD}>
                        {t("paymentCreditCard")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                        {t("paymentBankTransfer")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.DIGITAL_PAYMENT}>
                        {t("paymentDigitalPayment")}
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CHECK}>
                        {t("paymentCheck")}
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

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("destinationAccount")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createPaymentMutation.isPending}
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

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("note")} ({t("optional")})
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("notePlaceholder")}
                      {...field}
                      disabled={createPaymentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createPaymentMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending
                  ? t("saving")
                  : t("registerPayment")}
              </Button>
            </div>
          </form>
        </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
