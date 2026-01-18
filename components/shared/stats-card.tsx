"use client";

import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatsCard({
  label,
  value,
  description,
  icon: Icon,
  isLoading,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 min-w-[140px] shrink-0 sm:min-w-0 sm:shrink sm:p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16 sm:h-4 sm:w-24" />
          <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
        </div>
        <div className="mt-1.5 sm:mt-2">
          <Skeleton className="h-6 w-20 sm:h-7 sm:w-28" />
        </div>
        {description && <Skeleton className="h-3 w-16 mt-1 sm:mt-2" />}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 min-w-[140px] shrink-0 sm:min-w-0 sm:shrink sm:p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-muted-foreground">
          {label}
        </span>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
      </div>
      <div className="mt-1.5 sm:mt-2">
        <span className="text-lg sm:text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </span>
      </div>
      {description && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

interface StatsCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

/**
 * Wrapper component for StatsCards that provides horizontal scroll on mobile
 * and grid layout on larger screens
 */
export function StatsCardGrid({ children, columns = 4 }: StatsCardGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={`flex gap-3 overflow-x-auto pb-2 sm:grid ${gridCols[columns]} sm:gap-4 sm:overflow-visible sm:pb-0 scrollbar-hide`}
    >
      {children}
    </div>
  );
}
