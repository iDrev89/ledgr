"use client";

import { DataTable } from "@/components/ui/data-table";
import { createReceivableColumns } from "./receivable-columns";
import type { ReceivableWithDetails } from "@/lib/types/receivables";

interface ReceivableTableProps {
  receivables: ReceivableWithDetails[];
  onView: (receivable: ReceivableWithDetails) => void;
  onPayment: (receivable: ReceivableWithDetails) => void;
  onCancel: (receivable: ReceivableWithDetails) => void;
  t: (key: string) => string;
  locale?: string;
}

export function ReceivableTable({
  receivables,
  onView,
  onPayment,
  onCancel,
  t,
  locale,
}: ReceivableTableProps) {
  const columns = createReceivableColumns({ onView, onPayment, onCancel, t, locale });

  return (
    <DataTable
      columns={columns}
      data={receivables}      
      showPagination={true}
      pageSize={10}
    />
  );
}

