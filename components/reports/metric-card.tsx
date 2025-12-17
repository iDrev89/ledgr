import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricCardProps } from "@/lib/types/reports";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  onClick,
}: MetricCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        "",
        isClickable &&
          "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
          {isClickable && (
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500",
              )}
            >
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs periodo anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
