"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopProducts } from "@/hooks/use-dashboard";
import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const TopProductsCard = () => {
  const t = useTranslations("Dashboard");
  const { data, isLoading } = useTopProducts();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const rankColors = [
    { bg: "bg-yellow-500/20 dark:bg-yellow-500/30", text: "text-yellow-600 dark:text-yellow-400", icon: "🥇" },
    { bg: "bg-slate-400/20 dark:bg-slate-400/30", text: "text-slate-600 dark:text-slate-300", icon: "🥈" },
    { bg: "bg-orange-600/20 dark:bg-orange-600/30", text: "text-orange-700 dark:text-orange-400", icon: "🥉" },
    { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", icon: "🏅" },
    { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", icon: "🏅" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          {t("topProducts")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((product, index) => {
              const rank = rankColors[index] || rankColors[4];
              return (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                      rank.bg
                    )}>
                      {rank.icon}
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {product.quantity} {t("unitsSold")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t("noDataYet")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

