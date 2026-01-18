"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ReceivableCard } from "./receivable-card";
import { createReceivableColumns } from "./receivable-columns";
import type { ReceivableWithDetails } from "@/lib/types/receivables";

interface ReceivableTableProps {
  receivables: ReceivableWithDetails[];
  onView: (receivable: ReceivableWithDetails) => void;
  onPayment: (receivable: ReceivableWithDetails) => void;
  onCancel: (receivable: ReceivableWithDetails) => void;
  t: (key: string) => string;
  locale?: string;
  // Server-side search props
  enablePagination?: boolean;
}

export function ReceivableTable({
  receivables,
  onView,
  onPayment,
  onCancel,
  t,
  locale,
  enablePagination = true,
}: ReceivableTableProps) {
  const columns = createReceivableColumns({
    onView,
    onPayment,
    onCancel,
    t,
    locale,
  });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(receivable) => (
        <ReceivableCard
          receivable={receivable}
          onView={() => onView(receivable)}
          onPayment={() => onPayment(receivable)}
          onCancel={() => onCancel(receivable)}
          locale={locale}
        />
      )}
      data={receivables}
      searchPlaceholder={t("searchPlaceholder")}
      showPagination
      enablePagination={enablePagination}
      pageSize={10}
      emptyMessage={t("noReceivables")}
      onView={onView}
      locale={locale}
    />
  );
}
