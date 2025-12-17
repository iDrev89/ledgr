"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type {
  PurchaseReportDataEnhanced,
  BusinessSummaryDataEnhanced,
  DateRange,
} from "@/lib/types/reports";
import {
  exportPurchasesToExcel,
  exportBusinessSummaryToExcel,
} from "@/lib/excel-export";

type ReportType = "purchases" | "business";

interface ExportButtonProps {
  type: ReportType;
  data: PurchaseReportDataEnhanced | BusinessSummaryDataEnhanced | null;
  dateRange: DateRange;
  disabled?: boolean;
}

export function ExportButton({
  type,
  data,
  dateRange,
  disabled,
}: ExportButtonProps) {
  const t = useTranslations("Reports");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data) {
      toast.error(t("noDataToExport"));
      return;
    }

    setIsExporting(true);

    try {
      // Use setTimeout to allow UI to update before heavy operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (type === "purchases") {
        exportPurchasesToExcel(
          data as PurchaseReportDataEnhanced,
          dateRange
        );
      } else {
        exportBusinessSummaryToExcel(
          data as BusinessSummaryDataEnhanced,
          dateRange
        );
      }

      toast.success(t("exportSuccess"));
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error(t("exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting || !data}
      variant="outline"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {t("exportToExcel")}
    </Button>
  );
}

