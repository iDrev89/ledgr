"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { BankCard } from "./bank-card";
import { getBankColumns } from "./bank-columns";
import type { BankWithRelations } from "@/lib/types/bank";

interface BankTableProps {
  banks: BankWithRelations[];
  onEdit: (bank: BankWithRelations) => void;
  onDelete: (bank: BankWithRelations) => void;
  t: (key: string) => string;
}

export function BankTable({ banks, onEdit, onDelete, t }: BankTableProps) {
  const columns = getBankColumns({ onEdit, onDelete, t });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(bank) => (
        <BankCard
          bank={bank}
          onEdit={() => onEdit(bank)}
          onDelete={() => onDelete(bank)}
        />
      )}
      data={banks}
      searchKey="name"
      searchPlaceholder={t("searchPlaceholder")}
      showPagination={true}
      pageSize={10}
      emptyMessage={t("noBanks")}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
