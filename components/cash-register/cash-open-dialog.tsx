"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  openSessionSchema,
  type OpenSessionInput,
} from "@/lib/validations/cash-session";
import { useAccounts } from "@/hooks/use-accounts";
import { useBranches } from "@/hooks/use-branches";
import { useLastClosedSession, useOpenCashSession } from "@/hooks/use-cash-session";
import { useActiveBranch } from "@/hooks/use-active-branch";

interface CashOpenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value));

export const CashOpenDialog = ({ open, onOpenChange }: CashOpenDialogProps) => {
  const t = useTranslations("CashRegister");
  const tAccounts = useTranslations("Accounts");
  const { data: accountsData } = useAccounts({ activeOnly: true });
  const { data: branchesData } = useBranches({ activeOnly: true });
  const { activeBranchId } = useActiveBranch();
  const openMutation = useOpenCashSession();

  const cashAccounts = useMemo(
    () =>
      (accountsData?.accounts ?? []).filter(
        (a) => a.type === "CASH_REGISTER" || a.type === "PETTY_CASH"
      ),
    [accountsData]
  );
  const branches = branchesData?.branches ?? [];

  const form = useForm<OpenSessionInput>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      accountId: "",
      branchId: undefined,
      openingBalance: 0,
      openingNotes: "",
    },
  });

  const selectedAccountId = form.watch("accountId");
  const openingBalance = form.watch("openingBalance");

  const { data: lastClosedSession } = useLastClosedSession(selectedAccountId);

  const retainedAmount = useMemo(() => {
    if (!lastClosedSession?.retainedAmount) return null;
    return parseFloat(lastClosedSession.retainedAmount);
  }, [lastClosedSession]);

  const formattedRetainedAmount = retainedAmount != null ? formatCurrency(retainedAmount) : null;
  const showMismatchWarning =
    retainedAmount != null && openingBalance !== retainedAmount;

  useEffect(() => {
    if (open) {
      form.reset({
        accountId: "",
        branchId: activeBranchId ?? undefined,
        openingBalance: 0,
        openingNotes: "",
      });
    }
  }, [open, activeBranchId, form]);

  useEffect(() => {
    if (selectedAccountId && retainedAmount != null) {
      form.setValue("openingBalance", retainedAmount);
    }
  }, [selectedAccountId, retainedAmount, form]);

  const handleSubmit = async (values: OpenSessionInput) => {
    try {
      await openMutation.mutateAsync({
        ...values,
        branchId: values.branchId || undefined,
      });
      toast.success(t("openSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("openError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("openCash")}</DialogTitle>
          <DialogDescription>{t("openCashDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    disabled={openMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectAccount")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cashAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}{" "}
                          ({account.type === "CASH_REGISTER" ? tAccounts("typeCashRegister") : tAccounts("typePettyCash")})
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
                    onValueChange={(val) =>
                      field.onChange(val === "__none__" ? undefined : val)
                    }
                    value={field.value ?? "__none__"}
                    disabled={openMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectBranch")} />
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
            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("openingBalance")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder={t("openingBalancePlaceholder")}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      onFocus={(e) => e.target.select()}
                      disabled={openMutation.isPending}
                    />
                  </FormControl>
                  {retainedAmount != null && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 shrink-0" />
                      {t("previousRetained")} {formatCurrency(retainedAmount)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {showMismatchWarning && formattedRetainedAmount && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("openingMismatchWarning", { amount: formattedRetainedAmount })}
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="openingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("openingNotes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("openingNotesPlaceholder")}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={openMutation.isPending}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={openMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={openMutation.isPending}>
                {openMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("openCash")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
