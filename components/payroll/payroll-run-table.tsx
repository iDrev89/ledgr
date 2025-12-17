"use client";

import { useTranslations, useLocale } from "next-intl";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { PayrollRunCard } from "./payroll-run-card";
import { getPayrollRunColumns } from "./payroll-run-columns";
import type { PayrollRunWithDetails } from "@/lib/types/payroll";

interface PayrollRunTableProps {
  runs: PayrollRunWithDetails[];
  onView: (run: PayrollRunWithDetails) => void;
  onFinalize: (run: PayrollRunWithDetails) => void;
  onPay: (run: PayrollRunWithDetails) => void;
  onDelete: (run: PayrollRunWithDetails) => void;
}

export function PayrollRunTable({
  runs,
  onView,
  onFinalize,
  onPay,
  onDelete,
}: PayrollRunTableProps) {
  const t = useTranslations("Payroll");
  const locale = useLocale();

  const columns = getPayrollRunColumns(t, onView, onFinalize, onPay, onDelete);

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(run) => (
        <PayrollRunCard
          run={run}
          onView={() => onView(run)}
          locale={locale}
        />
      )}
      data={runs}
      searchKey="periodLabel"
      searchPlaceholder={t("searchPlaceholder")}
      showPagination={true}
      pageSize={10}
      emptyMessage={t("noPayrollRuns")}
      onView={onView}
      locale={locale}
    />
  );
}
