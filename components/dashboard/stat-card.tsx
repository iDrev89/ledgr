"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
}

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  loading,
}: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && change !== 0;

  if (loading) {
    return (
      <Card className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="mt-2">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="mt-2">
          <Skeleton className="h-3 w-20" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border border-border bg-card p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </span>
        {hasChange && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </Card>
  );
};
