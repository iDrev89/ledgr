"use client";

import { BranchSelector } from "@/components/ui/branch-selector";
import { BusinessLineSelector } from "@/components/ui/business-line-selector";
import { useTranslations } from "next-intl";

interface ReportFiltersProps {
  branchId?: string | null;
  onBranchChange?: (value: string | null) => void;
  businessLineId?: string | null;
  onBusinessLineChange?: (value: string | null) => void;
  showBranch?: boolean;
  showBusinessLine?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ReportFilters = ({
  branchId,
  onBranchChange,
  businessLineId,
  onBusinessLineChange,
  showBranch = true,
  showBusinessLine = true,
  disabled = false,
  children,
}: ReportFiltersProps) => {
  const t = useTranslations("Reports");

  return (
    <div className="flex flex-wrap items-end gap-3">
      {children}
      {showBranch && onBranchChange && (
        <div className="w-48">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            {t("filterByBranch")}
          </label>
          <BranchSelector
            value={branchId ?? null}
            onValueChange={onBranchChange}
            disabled={disabled}
            allowNone
          />
        </div>
      )}
      {showBusinessLine && onBusinessLineChange && (
        <div className="w-48">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            {t("filterByBusinessLine")}
          </label>
          <BusinessLineSelector
            value={businessLineId ?? null}
            onValueChange={onBusinessLineChange}
            disabled={disabled}
            allowNone
          />
        </div>
      )}
    </div>
  );
};
