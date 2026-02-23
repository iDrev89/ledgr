"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CashSessionWithRelations } from "@/lib/types/cash-session";
import { CashSessionStatus } from "@/prisma/prisma-client";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

type CashSessionStatusBannerProps = {
  session: CashSessionWithRelations | null | undefined;
  isLoading: boolean;
};

export const CashSessionStatusBanner = ({
  session,
  isLoading,
}: CashSessionStatusBannerProps) => {
  const t = useTranslations("CashRegister");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-md border border-l-2 border-l-border px-4 py-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-4 rounded-md border border-l-2 border-l-warning px-4 py-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t("noActiveSession")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("noActiveSessionDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (session.status !== CashSessionStatus.OPEN) {
    return null;
  }

  const openedAt = new Date(session.openedAt);
  const openingBalanceNum = parseFloat(session.openingBalance);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-l-2 border-l-success px-4 py-3 text-sm">
      <div className="flex items-center gap-2.5">
        <span className="font-medium text-foreground">
          {session.account.name}
        </span>
        <Badge variant="success">{t("statusOpen")}</Badge>
      </div>
      <span className="text-muted-foreground hidden sm:inline">·</span>
      <span className="text-muted-foreground">
        {t("openedBy")}:{" "}
        <span className="text-foreground">{session.openedBy.name}</span>
      </span>
      <span className="text-muted-foreground hidden sm:inline">·</span>
      <span className="font-mono tabular-nums text-foreground">
        {formatCurrency(openingBalanceNum)}
      </span>
      <span className="text-muted-foreground hidden sm:inline">·</span>
      <span className="text-muted-foreground ml-auto">
        {formatDistanceToNow(openedAt, {
          addSuffix: true,
          locale: dateLocale,
        })}
      </span>
    </div>
  );
};
