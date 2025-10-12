"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
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

  const columns = getPayrollRunColumns(t, onView, onFinalize, onPay, onDelete);

  return (
    <DataTable
      columns={columns}
      data={runs}
      searchKey="periodLabel"
      searchPlaceholder={t("searchPlaceholder")}
      showPagination={true}
      pageSize={10}
    />
  );
}

