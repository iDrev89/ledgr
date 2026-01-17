"use client";

import { useTranslations, useLocale } from "next-intl";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { TransactionCard } from "./transaction-card";
import { createTransactionColumns } from "./transaction-columns";

interface TransactionTableProps {
  transactions: BankTransactionWithRelations[];
  // Server-side search props
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean;
}

export const TransactionTable = ({
  transactions,
  searchValue,
  onSearchChange,
  isSearching,
}: TransactionTableProps) => {
  const t = useTranslations("BankTransactions");
  const locale = useLocale();

  const columns = createTransactionColumns({
    t,
    locale,
  });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(transaction) => (
        <TransactionCard transaction={transaction} locale={locale} />
      )}
      data={transactions}
      searchPlaceholder={t("searchPlaceholder")}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      isSearching={isSearching}
      showPagination
      pageSize={20}
      emptyMessage={t("noTransactions")}
      locale={locale}
    />
  );
};
