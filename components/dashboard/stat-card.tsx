"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
  color?: "blue" | "green" | "orange" | "purple";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-500/10 dark:bg-green-500/20",
    text: "text-green-600 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400",
  },
  orange: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    icon: "text-orange-600 dark:text-orange-400",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    icon: "text-purple-600 dark:text-purple-400",
  },
};

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  loading,
  color = "blue",
}: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && change !== 0;
  const colors = colorClasses[color];

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      {/* Decorative background element */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-20",
          colors.bg,
        )}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div
              className={cn("text-3xl font-bold tracking-tight", colors.text)}
            >
              {value}
            </div>
            {hasChange && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="gap-1 px-2 py-0"
                >
                  {isPositive ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span className="font-semibold">{Math.abs(change)}%</span>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </div>
            )}
            {!hasChange && description && (
              <p className="text-xs text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
