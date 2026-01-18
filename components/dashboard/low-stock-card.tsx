"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLowStockAlerts } from "@/hooks/use-dashboard";
import { useTranslations } from "next-intl";
import { AlertTriangle, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const LowStockCard = () => {
  const t = useTranslations("Dashboard");
  const { data, isLoading } = useLowStockAlerts();

  const getStockLevel = (stock: number) => {
    if (stock === 0)
      return { text: t("outOfStock"), variant: "destructive" as const };
    if (stock <= 5)
      return { text: t("critical"), variant: "destructive" as const };
    return { text: t("low"), variant: "secondary" as const };
  };

  return (
    <Card className="rounded-lg border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">
            {t("lowStockAlerts")}
          </CardTitle>
          {!isLoading && data && data.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {data.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.map((product) => {
              const level = getStockLevel(product.currentStock);
              return (
                <div
                  key={product.productId}
                  className="flex flex-col gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={level.variant} className="text-xs">
                      {level.text}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-2">
                      {product.productName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.currentStock} {t("unitsRemaining")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("allProductsStocked")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
