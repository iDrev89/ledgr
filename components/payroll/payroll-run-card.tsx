"use client";

import { Eye, Calendar, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Periodo + Estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{run.periodLabel}</h3>
            <Badge variant={statusConfig.variant} className="mt-1">
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Fechas */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{periodTypes[run.periodType as keyof typeof periodTypes]}</p>
            <p className="text-sm font-medium">
              {format(new Date(run.startDate), "dd MMM", { locale: dateLocale })} -{" "}
              {format(new Date(run.endDate), "dd MMM yyyy", { locale: dateLocale })}
            </p>
          </div>
        </div>

        <Separator />

        {/* Empleados */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t("employees")}</p>
            <p className="text-sm font-medium">{employeeCount}</p>
          </div>
        </div>

        <Separator />

        {/* Total a Pagar - Disabled: calculate from payments */}
        {/* <div className="bg-primary/5 rounded-md p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("totalPayable")}</p>
              <p className="text-xl font-bold">
                {formatCurrency(run.totalPayable)}
              </p>
            </div>
          </div>
        </div> */}

        {/* Balance Pendiente (si existe) - Disabled: calculate from payments */}
        {/* {parseFloat(run.totalBalance) > 0 && (
          <>
            <Separator />
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {t("balance")}: {formatCurrency(run.totalBalance)}
              </p>
            </div>
          </>
        )} */}

        <Separator />

        {/* Footer: Botón Ver */}
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("view")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

