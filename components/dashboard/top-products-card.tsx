"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopProducts } from "@/hooks/use-dashboard";
import { useTranslations } from "next-intl";
import { Package, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TopProductsCardProps {
  branchId?: string;
  businessLineId?: string;
}

export const TopProductsCard = ({ branchId, businessLineId }: TopProductsCardProps = {}) => {
  const t = useTranslations("Dashboard");
  const tProducts = useTranslations("Products");
  const { data, isLoading } = useTopProducts({ branchId, businessLineId });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <Card className="rounded-lg border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              {t("topProducts")}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            <Package className="h-3 w-3 mr-1" />
            {tProducts("product")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-2">
            {data.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">
                      {product.productName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {product.quantity} {t("unitsSold")}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t("noDataYet")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
