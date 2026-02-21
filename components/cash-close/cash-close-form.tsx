"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cashCloseSchema, type CashCloseInput } from "@/lib/validations/cash-close";
import { useAccounts } from "@/hooks/use-accounts";
import { useBranches } from "@/hooks/use-branches";
import { useExpectedBalance } from "@/hooks/use-cash-close";
import { cn } from "@/lib/utils";

interface CashCloseFormProps {
  onSubmit: (data: CashCloseInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export function CashCloseForm({
  onSubmit,
  onCancel,
  isLoading,
}: CashCloseFormProps) {
  const t = useTranslations("CashClose");
  const { data: accountsData } = useAccounts({ activeOnly: true });
  const { data: branchesData } = useBranches({ activeOnly: true });

  const cashAccounts = useMemo(
    () =>
      (accountsData?.accounts || []).filter(
        (a) => a.type === "CASH_REGISTER" || a.type === "PETTY_CASH"
      ),
    [accountsData]
  );
  const branches = branchesData?.branches || [];

  const form = useForm<CashCloseInput>({
    resolver: zodResolver(cashCloseSchema),
    defaultValues: {
      accountId: "",
      branchId: null,
      actualBalance: 0,
      notes: "",
    },
  });

  const selectedAccountId = form.watch("accountId");
  const actualBalance = form.watch("actualBalance");

  const { data: expectedData, isLoading: isLoadingExpected } =
    useExpectedBalance(selectedAccountId);

  const expectedBalance = expectedData?.expectedBalance ?? 0;
  const difference = (actualBalance ?? 0) - expectedBalance;

  const differenceColor = useMemo(() => {
    if (difference === 0) return "text-green-600";
    if (difference < 0) return "text-red-600";
    return "text-yellow-600";
  }, [difference]);

  const handleSubmit = async (data: CashCloseInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting cash close:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("account")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("accountPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cashAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
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
              <Select
                onValueChange={(val) => field.onChange(val === "__none__" ? null : val)}
                value={field.value || "__none__"}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("branchPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">{t("noBranch")}</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAccountId && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("expectedBalance")}
              </span>
              <span className="text-sm font-semibold">
                {isLoadingExpected ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  formatCurrency(expectedBalance)
                )}
              </span>
            </div>

            {!isLoadingExpected && actualBalance !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("difference")}
                </span>
                <span className={cn("text-sm font-semibold", differenceColor)}>
                  {formatCurrency(difference)}
                </span>
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="actualBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("actualBalance")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("notesPlaceholder")}
                  {...field}
                  value={field.value ?? ""}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
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
            {t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
