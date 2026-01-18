"use client";

import { useTranslations } from "next-intl";
import {
  DollarSign,
  ShoppingCart,
  Banknote,
  ArrowRightLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeSalesStats } from "@/hooks/use-sales";

interface SalesStatsCardsProps {
  sellerId?: string;
}

export function SalesStatsCards({ sellerId }: SalesStatsCardsProps) {
  const t = useTranslations("Sales");
  const { data: stats, isLoading } = useEmployeeSalesStats({ sellerId });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value || "0"));
  };

  const statCards = [
    {
      label: t("stats.daySales"),
      value: formatCurrency(stats?.totalAmount || "0"),
      icon: DollarSign,
    },
    {
      label: t("stats.transactions"),
      value: stats?.transactionCount?.toString() || "0",
      icon: ShoppingCart,
    },
    {
      label: t("stats.cashTotal"),
      value: formatCurrency(stats?.cashAmount || "0"),
      icon: Banknote,
    },
    {
      label: t("stats.transferTotal"),
      value: formatCurrency(stats?.transferAmount || "0"),
      icon: ArrowRightLeft,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0 scrollbar-hide">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-3 min-w-[140px] sm:min-w-0 sm:p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 sm:h-4 sm:w-24" />
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
            </div>
            <div className="mt-1.5 sm:mt-2">
              <Skeleton className="h-6 w-20 sm:h-8 sm:w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0 scrollbar-hide">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-3 min-w-[140px] shrink-0 sm:min-w-0 sm:shrink sm:p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {stat.label}
            </span>
            <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-lg sm:text-2xl font-semibold text-foreground tracking-tight">
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
