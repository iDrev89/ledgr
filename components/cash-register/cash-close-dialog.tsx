"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { closeSessionSchema } from "@/lib/validations/cash-session";
import type { CashSessionWithRelations } from "@/lib/types/cash-session";
import { useExpectedBalance, useCloseCashSession } from "@/hooks/use-cash-session";
import { useAccounts } from "@/hooks/use-accounts";
import { getAccountTypeLabel } from "@/lib/payment-utils";
import { cn } from "@/lib/utils";

const CURRENCY_FORMAT = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface CashCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSessionWithRelations;
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return CURRENCY_FORMAT.format(isNaN(num) ? 0 : num);
};

export const CashCloseDialog = ({
  open,
  onOpenChange,
  session,
}: CashCloseDialogProps) => {
  const t = useTranslations("CashRegister");
  const tAccounts = useTranslations("Accounts");
  const { data: expectedData, isLoading: isLoadingExpected } = useExpectedBalance(
    session.id,
  );
  const { data: accountsData } = useAccounts({ activeOnly: true });
  const closeMutation = useCloseCashSession();

  const bankAccounts =
    accountsData?.accounts?.filter((a) => a.type === "BANK") ?? [];
  const expectedBalance = expectedData?.expectedBalance ?? "0";

  const formSchema = closeSessionSchema.superRefine((data, ctx) => {
    const deposit = data.actualBalance - data.retainedAmount;
    if (
      deposit > 0 &&
      (!data.depositAccountId || data.depositAccountId.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("depositAccountRequired"),
        path: ["depositAccountId"],
      });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionId: session.id,
      actualBalance: 0,
      retainedAmount: 0,
      depositAccountId: "",
      closingNotes: "",
    },
  });

  useEffect(() => {
    if (open && session) {
      form.reset({
        sessionId: session.id,
        actualBalance: 0,
        retainedAmount: 0,
        depositAccountId: "",
        closingNotes: "",
      });
    }
  }, [open, session?.id]);

  const actualBalance = form.watch("actualBalance");
  const retainedAmount = form.watch("retainedAmount");
  const expectedNum = parseFloat(expectedBalance);
  const difference = actualBalance - expectedNum;
  const deposit = actualBalance - retainedAmount;

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await closeMutation.mutateAsync({
        sessionId: data.sessionId,
        actualBalance: data.actualBalance,
        retainedAmount: data.retainedAmount,
        depositAccountId:
          deposit > 0 && data.depositAccountId?.trim()
            ? data.depositAccountId
            : undefined,
        closingNotes: data.closingNotes?.trim() || undefined,
      });
      toast.success(t("closeSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("closeError"), {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const getDifferenceLabel = () => {
    if (difference === 0) return t("differenceOk");
    if (difference < 0) return t("differenceShort");
    return t("differenceOver");
  };

  const getDifferenceStyles = () => {
    if (difference === 0) return "text-green-600 dark:text-green-400";
    if (difference < 0) return "text-red-600 dark:text-red-400";
    return "text-amber-600 dark:text-amber-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("closeCash")}</DialogTitle>
          <DialogDescription>{t("closeCashDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>{t("expectedBalance")}</FormLabel>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono tabular-nums">
                {isLoadingExpected ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  formatCurrency(expectedBalance)
                )}
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="actualBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("actualBalance")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.01}
                      placeholder={t("actualBalancePlaceholder")}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(
                          v === "" ? 0 : parseFloat(v) || 0,
                        );
                      }}
                      onFocus={(e) => e.target.select()}
                      disabled={closeMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retainedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("retainedAmount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.01}
                      placeholder={t("retainedAmountPlaceholder")}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(
                          v === "" ? 0 : parseFloat(v) || 0,
                        );
                      }}
                      onFocus={(e) => e.target.select()}
                      disabled={closeMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border overflow-hidden divide-y divide-border">
              <div className="flex justify-between items-center text-sm px-3 py-2">
                <span className="text-muted-foreground">{t("difference")}:</span>
                <span className={cn("font-mono font-medium tabular-nums", getDifferenceStyles())}>
                  {formatCurrency(difference)}{" "}
                  <span className="font-sans text-xs font-normal">
                    — {getDifferenceLabel()}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm px-3 py-2">
                <span className="text-muted-foreground">{t("depositAmount")}:</span>
                <span className="font-mono font-medium tabular-nums">
                  {formatCurrency(Math.max(0, deposit))}
                </span>
              </div>
            </div>

            {deposit > 0 && (
              <FormField
                control={form.control}
                name="depositAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("depositAccount")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={closeMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("selectDepositAccount")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                          >
                            <div className="flex items-center gap-2">
                              <span>{account.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {getAccountTypeLabel(
                                  account.type,
                                  (k) => tAccounts(k),
                                )}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="closingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("closingNotes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("closingNotesPlaceholder")}
                      rows={3}
                      {...field}
                      disabled={closeMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={closeMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={closeMutation.isPending}>
                {closeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {closeMutation.isPending ? t("closing") : t("closeCash")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
