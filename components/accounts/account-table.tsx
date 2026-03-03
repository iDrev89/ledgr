"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { AccountCard } from "./account-card";
import { getAccountColumns } from "./account-columns";
import type { AccountWithRelations } from "@/lib/types/account";

interface AccountTableProps {
  accounts: AccountWithRelations[];
  onEdit: (account: AccountWithRelations) => void;
  onDelete: (account: AccountWithRelations) => void;
  t: (key: string) => string;
  enablePagination?: boolean;
}

export function AccountTable({
  accounts,
  onEdit,
  onDelete,
  t,
  enablePagination = true,
}: AccountTableProps) {
  const columns = getAccountColumns({ onEdit, onDelete, t });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(account) => (
        <AccountCard
          account={account}
          onEdit={() => onEdit(account)}
          onDelete={() => onDelete(account)}
        />
      )}
      data={accounts}
      showPagination
      enablePagination={enablePagination}
      pageSize={10}
      emptyMessage={t("noAccounts")}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
