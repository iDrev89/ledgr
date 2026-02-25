"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 lg:grid-cols-5 divide-y divide-border lg:divide-y-0 lg:divide-x divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`px-5 py-4 ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-28 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const cells = [
    {
      label: t("stats.daySales"),
      value: formatCurrency(stats?.totalAmount || "0"),
      valueClass: "text-success",
    },
    {
      label: t("stats.transactions"),
      value: stats?.transactionCount?.toString() || "0",
      valueClass: "text-foreground",
    },
    {
      label: t("stats.cashTotal"),
      value: formatCurrency(stats?.cashAmount || "0"),
      valueClass: "text-foreground",
    },
    {
      label: t("stats.transferTotal"),
      value: formatCurrency(stats?.transferAmount || "0"),
      valueClass: "text-foreground",
    },
    {
      label: t("stats.tipTotal"),
      value: formatCurrency(stats?.tipAmount || "0"),
      valueClass: "text-foreground",
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y divide-border lg:divide-y-0 lg:divide-x divide-border">
          {cells.map((cell, i) => (
            <div
              key={cell.label}
              className={`px-5 py-4 ${i === cells.length - 1 && cells.length % 2 !== 0 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cell.label}
              </p>
              <p
                className={`mt-1.5 font-mono tabular-nums text-xl font-semibold ${cell.valueClass}`}
              >
                {cell.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
