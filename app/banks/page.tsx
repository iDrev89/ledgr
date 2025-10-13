"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle, ArrowLeftRight, Activity, Wallet } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { BankTable } from "@/components/banks/bank-table";
import { BankDialog } from "@/components/banks/bank-dialog";
import { TransactionTable } from "@/components/bank-transactions/transaction-table";
import { TransferDialog } from "@/components/bank-transactions/transfer-dialog";
import { useBanks, useDeleteBank } from "@/hooks/use-banks";
import { useBankTransactions, useBanksWithBalance } from "@/hooks/use-bank-transactions";
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
  
  const [selectedBank, setSelectedBank] = useState<BankWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<BankWithRelations | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const { data, isLoading, error } = useBanks();
  const { data: banksWithBalance, isLoading: loadingBalance } = useBanksWithBalance();
  const { data: transactionsData, isLoading: loadingTransactions, error: transactionsError } = useBankTransactions();
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

  const totalBalance = banksWithBalance?.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateTransfer} variant="outline">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {t("createTransfer")}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createBank")}
          </Button>
        </div>
      </div>

      {/* Resumen de saldos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalBalance")}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {t("acrossAllBanks")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeBanks")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banksWithBalance?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("banksConfigured")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("recentActivity")}</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("totalTransactions")}
            </p>
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
              {t("deleteConfirmDescription", { name: bankToDelete?.name || "" })}
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

