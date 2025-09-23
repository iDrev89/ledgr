"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  trend = "neutral",
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
      case "decrease":
        return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${getChangeColor()}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {change !== undefined && (
              <Badge variant="secondary" className={getChangeColor()}>
                {change > 0 ? "+" : ""}
                {change}%
              </Badge>
            )}
            {getTrendIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
