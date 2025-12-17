"use client";

import { useTranslations, useLocale } from "next-intl";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { TransactionCard } from "./transaction-card";
import { createTransactionColumns } from "./transaction-columns";

interface TransactionTableProps {
  transactions: BankTransactionWithRelations[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
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
        <TransactionCard
          transaction={transaction}
          locale={locale}
        />
      )}
      data={transactions}
      searchKey={["description", "reference"]}
      searchPlaceholder={t("searchPlaceholder")}
      showPagination
      pageSize={20}
      emptyMessage={t("noTransactions")}
      locale={locale}
    />
  );
};
