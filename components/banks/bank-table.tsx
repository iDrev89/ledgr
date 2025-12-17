"use client";

import { DataTable } from "@/components/ui/data-table";
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
    <DataTable
      columns={columns}
      data={banks}
      searchKey="name"
      searchPlaceholder={t("searchPlaceholder")}
      showPagination={true}
      pageSize={10}
    />
  );
}
