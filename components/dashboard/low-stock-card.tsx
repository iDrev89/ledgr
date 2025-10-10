"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLowStockAlerts } from "@/hooks/use-dashboard";
import { useTranslations } from "next-intl";
import { AlertTriangle, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const LowStockCard = () => {
  const t = useTranslations("Dashboard");
  const { data, isLoading } = useLowStockAlerts();

  const getStockLevel = (stock: number) => {
    if (stock === 0) return { 
      text: t("outOfStock"), 
      color: "destructive" as const,
      icon: "🚫",
      bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
    };
    if (stock <= 5) return { 
      text: t("critical"), 
      color: "destructive" as const,
      icon: "⚠️",
      bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
    };
    return { 
      text: t("low"), 
      color: "warning" as const,
      icon: "📦",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          {t("lowStockAlerts")}
          {!isLoading && data && data.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {data.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.map((product) => {
              const level = getStockLevel(product.currentStock);
              return (
                <div
                  key={product.productId}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-lg border transition-all hover:shadow-sm",
                    level.bgColor
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-2xl">{level.icon}</div>
                    <Badge variant={level.color} className="text-xs">
                      {level.text}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-sm line-clamp-2">{product.productName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        {product.currentStock} {t("unitsRemaining")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("allProductsStocked")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

