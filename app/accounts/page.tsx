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
import { AccountTable } from "@/components/accounts/account-table";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { TransactionTable } from "@/components/account-transactions/transaction-table";
import { TransferDialog } from "@/components/account-transactions/transfer-dialog";
import { useAccounts, useDeleteAccount } from "@/hooks/use-accounts";
import {
  useAccountTransactions,
  useAccountsWithBalance,
} from "@/hooks/use-account-transactions";
import { useDebounce } from "@/hooks/use-debounce";
import { StatsCard } from "@/components/shared/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import type { AccountWithRelations } from "@/lib/types/account";
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

export default function AccountsPage() {
  const t = useTranslations("Accounts");
  const tTransactions = useTranslations("AccountTransactions");

  const [selectedAccount, setSelectedAccount] =
    useState<AccountWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] =
    useState<AccountWithRelations | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const [accountSearch, setAccountSearch] = useState("");
  const debouncedAccountSearch = useDebounce(accountSearch, 300);
  const [transactionSearch, setTransactionSearch] = useState("");

  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  useEffect(() => {
    pagination.setPage(0);
  }, [debouncedAccountSearch]);

  const {
    data: accountsData,
    isLoading: loadingAccounts,
    error: accountsError,
    isFetching: accountsFetching,
  } = useAccountsWithBalance({
    search: debouncedAccountSearch || undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });
  const isAccountSearching = accountsFetching && !loadingAccounts;

  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    error: transactionsError,
    isFetching: transactionsFetching,
  } = useAccountTransactions();
  const isTransactionSearching =
    transactionsFetching && !loadingTransactions && !!transactionSearch;

  const deleteMutation = useDeleteAccount();

  const handleCreate = () => {
    setSelectedAccount(null);
    setDialogOpen(true);
  };

  const handleEdit = (account: AccountWithRelations) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleDelete = (account: AccountWithRelations) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await deleteMutation.mutateAsync(accountToDelete.id);
      toast.success(t("deleteSuccess"));
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
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

  const totalBalance = accountsData?.totalBalance || 0;

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
            {t("createAccount")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard
          label={t("totalBalance")}
          value={formatCurrency(totalBalance)}
          description={t("acrossAllAccounts")}
          icon={Wallet}
          isLoading={loadingAccounts}
        />
        <StatsCard
          label={t("activeAccounts")}
          value={accountsData?.total || 0}
          description={t("accountsConfigured")}
          icon={Activity}
          isLoading={loadingAccounts}
        />
        <StatsCard
          label={t("recentActivity")}
          value={transactionsData?.total || 0}
          description={t("totalTransactions")}
          icon={ArrowLeftRight}
          isLoading={loadingTransactions}
        />
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">
            <Wallet className="mr-2 h-4 w-4" />
            {t("accounts")}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Activity className="mr-2 h-4 w-4" />
            {t("transactions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{t("accountsTitle")}</CardTitle>
                  <CardDescription>{t("accountsDescription")}</CardDescription>
                </div>
                <div className="w-full md:w-auto md:min-w-[300px]">
                  <SearchInput
                    value={accountSearch}
                    onChange={setAccountSearch}
                    placeholder={t("searchPlaceholder")}
                    isLoading={isAccountSearching}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {accountsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {accountsError instanceof Error
                      ? accountsError.message
                      : t("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {loadingAccounts ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <AccountTable
                    accounts={
                      (accountsData?.accounts as AccountWithRelations[]) || []
                    }
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    t={t}
                    enablePagination={false}
                  />
                  <PaginationControl
                    currentPage={pagination.page}
                    totalCount={accountsData?.total || 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={pagination.onPageChange}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={selectedAccount}
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
                name: accountToDelete?.name || "",
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
