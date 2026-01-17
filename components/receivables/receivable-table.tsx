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
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean;
}

export function ReceivableTable({
  receivables,
  onView,
  onPayment,
  onCancel,
  t,
  locale,
  searchValue,
  onSearchChange,
  isSearching,
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
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      isSearching={isSearching}
      showPagination={true}
      pageSize={10}
      emptyMessage={t("noReceivables")}
      onView={onView}
      locale={locale}
    />
  );
}
