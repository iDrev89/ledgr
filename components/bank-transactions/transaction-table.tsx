"use client";

import { useTranslations, useLocale } from "next-intl";
import type { BankTransactionWithRelations } from "@/lib/types/bank-transactions";
import { DataTable } from "@/components/ui/data-table";
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

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noTransactions")}</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={transactions}
      searchKey={["description", "reference"]}
      searchPlaceholder={t("searchPlaceholder")}
      showPagination
      pageSize={20}
    />
  );
};
