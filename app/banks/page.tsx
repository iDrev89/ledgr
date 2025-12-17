"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  AlertCircle,
  ArrowLeftRight,
  Activity,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { BankTable } from "@/components/banks/bank-table";
import { BankDialog } from "@/components/banks/bank-dialog";
import { TransactionTable } from "@/components/bank-transactions/transaction-table";
import { TransferDialog } from "@/components/bank-transactions/transfer-dialog";
import { useBanks, useDeleteBank } from "@/hooks/use-banks";
import {
  useBankTransactions,
  useBanksWithBalance,
} from "@/hooks/use-bank-transactions";
import type { BankWithRelations } from "@/lib/types/bank";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BanksPage() {
  const t = useTranslations("Banks");
  const tTransactions = useTranslations("BankTransactions");

  const [selectedBank, setSelectedBank] = useState<BankWithRelations | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<BankWithRelations | null>(
    null,
  );
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const { data, isLoading, error } = useBanks();
  const { data: banksWithBalance, isLoading: loadingBalance } =
    useBanksWithBalance();
  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    error: transactionsError,
  } = useBankTransactions();
  const deleteMutation = useDeleteBank();

  const handleCreate = () => {
    setSelectedBank(null);
    setDialogOpen(true);
  };

  const handleEdit = (bank: BankWithRelations) => {
    setSelectedBank(bank);
    setDialogOpen(true);
  };

  const handleDelete = (bank: BankWithRelations) => {
    setBankToDelete(bank);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bankToDelete) return;

    try {
      await deleteMutation.mutateAsync(bankToDelete.id);
      toast.success(t("deleteSuccess"));
      setDeleteDialogOpen(false);
      setBankToDelete(null);
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleCreateTransfer = () => {
    setTransferDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance =
    banksWithBalance?.reduce(
      (sum, bank) => sum + (bank.currentBalance || 0),
      0,
    ) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={handleCreateTransfer} variant="outline" className="w-full sm:w-auto">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {t("createTransfer")}
          </Button>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t("createBank")}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact Design */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t("totalBalance")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("acrossAllBanks")}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t("activeBanks")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {banksWithBalance?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("banksConfigured")}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t("recentActivity")}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {transactionsData?.total || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("totalTransactions")}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="banks" className="w-full">
        <TabsList>
          <TabsTrigger value="banks">
            <Wallet className="mr-2 h-4 w-4" />
            {t("banks")}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Activity className="mr-2 h-4 w-4" />
            {t("transactions")}
          </TabsTrigger>
        </TabsList>

        {/* Banks Tab */}
        <TabsContent value="banks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("banksTitle")}</CardTitle>
                  <CardDescription>{t("banksDescription")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error instanceof Error ? error.message : t("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading || loadingBalance ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <BankTable
                  banks={banksWithBalance || []}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  t={t}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{tTransactions("transactionHistory")}</CardTitle>
                  <CardDescription>
                    {tTransactions("transactionHistoryDescription")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {transactionsError instanceof Error
                      ? transactionsError.message
                      : tTransactions("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {loadingTransactions ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <TransactionTable
                  transactions={transactionsData?.transactions || []}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BankDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bank={selectedBank}
      />

      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", {
                name: bankToDelete?.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
