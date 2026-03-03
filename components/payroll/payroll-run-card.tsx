"use client";

import { Eye, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PayrollRunWithDetails } from "@/lib/types/payroll";
import { PayrollRunStatus } from "@/prisma/prisma-client";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface PayrollRunCardProps {
  run: PayrollRunWithDetails;
  onView: () => void;
  locale?: string;
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

const getStatusBadge = (status: PayrollRunStatus, t: (key: string) => string) => {
  const configs = {
    [PayrollRunStatus.DRAFT]: {
      label: t("statusDraft"),
      variant: "secondary" as const,
    },
    [PayrollRunStatus.FINALIZED]: {
      label: t("statusFinalized"),
      variant: "default" as const,
    },
    [PayrollRunStatus.PAID]: {
      label: t("statusPaid"),
      variant: "outline" as const,
    },
  };
  return configs[status];
};

export function PayrollRunCard({
  run,
  onView,
  locale = "es",
}: PayrollRunCardProps) {
  const t = useTranslations("Payroll");
  const dateLocale = locale === "es" ? es : enUS;
  const statusConfig = getStatusBadge(run.status, t);
  const employeeCount = run._count?.items || run.items?.length || 0;

  const periodTypes = {
    DAILY: t("periodTypeDaily"),
    BIWEEKLY: t("periodTypeBiweekly"),
    CUSTOM: t("periodTypeCustom"),
  };

  return (
    <Card
      className="hover:bg-accent/50 transition-all cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{run.periodLabel}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {periodTypes[run.periodType as keyof typeof periodTypes]}
            </p>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        {/* Data rows — ledger rhythm */}
        <div className="border-t border-border/60 divide-y divide-border/40 px-4 py-1">
          <div className="flex items-center gap-2 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {format(new Date(run.startDate), "dd MMM", { locale: dateLocale })}{" "}
              —{" "}
              {format(new Date(run.endDate), "dd MMM yyyy", {
                locale: dateLocale,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {employeeCount} {t("employees").toLowerCase()}
            </span>
          </div>
        </div>

        {/* Footer action */}
        <div className="flex items-center justify-end px-4 pb-3 pt-2 border-t border-border/60">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {t("view")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

