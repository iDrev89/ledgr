"use client";

import { useState, useEffect } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";
import { StatsCard } from "@/components/shared/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
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

  // Server-side search states
  const [bankSearch, setBankSearch] = useState("");
  const debouncedBankSearch = useDebounce(bankSearch, 300);
  const [transactionSearch, setTransactionSearch] = useState("");

  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  // Reset pagination when search changes
  useEffect(() => {
    pagination.setPage(0);
  }, [debouncedBankSearch]);

  const {
    data: banksData,
    isLoading: loadingBanks,
    error: banksError,
    isFetching: banksFetching,
  } = useBanksWithBalance({
    search: debouncedBankSearch || undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });
  const isBankSearching = banksFetching && !loadingBanks;

  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    error: transactionsError,
    isFetching: transactionsFetching,
  } = useBankTransactions();
  // Note: useBankTransactions doesn't support search yet
  const isTransactionSearching =
    transactionsFetching && !loadingTransactions && !!transactionSearch;

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

  const totalBalance = banksData?.totalBalance || 0;

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
          <Button
            onClick={handleCreateTransfer}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {t("createTransfer")}
          </Button>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t("createBank")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard
          label={t("totalBalance")}
          value={formatCurrency(totalBalance)}
          description={t("acrossAllBanks")}
          icon={Wallet}
          isLoading={loadingBanks}
        />
        <StatsCard
          label={t("activeBanks")}
          value={banksData?.total || 0}
          description={t("banksConfigured")}
          icon={Activity}
          isLoading={loadingBanks}
        />
        <StatsCard
          label={t("recentActivity")}
          value={transactionsData?.total || 0}
          description={t("totalTransactions")}
          icon={ArrowLeftRight}
          isLoading={loadingTransactions}
        />
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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{t("banksTitle")}</CardTitle>
                  <CardDescription>{t("banksDescription")}</CardDescription>
                </div>
                <div className="w-full md:w-auto md:min-w-[300px]">
                  <SearchInput
                    value={bankSearch}
                    onChange={setBankSearch}
                    placeholder={t("searchPlaceholder")}
                    isLoading={isBankSearching}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {banksError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {banksError instanceof Error
                      ? banksError.message
                      : t("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {loadingBanks ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <BankTable
                    banks={(banksData?.banks as BankWithRelations[]) || []}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    t={t}
                    enablePagination={false}
                  />
                  <PaginationControl
                    currentPage={pagination.page}
                    totalCount={banksData?.total || 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={pagination.onPageChange}
                  />
                </>
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
                  searchValue={transactionSearch}
                  onSearchChange={setTransactionSearch}
                  isSearching={isTransactionSearching}
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
