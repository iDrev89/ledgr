"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SaleTable } from "@/components/sales/sale-table";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { useSales } from "@/hooks/use-sales";
import type { SaleWithDetails } from "@/lib/types/sales";

export default function SalesPage() {
  const t = useTranslations("Sales");
  const locale = useLocale();
  const router = useRouter();
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data, isLoading, error } = useSales();

  const handleCreate = () => {
    router.push("/sales/new");
  };

  const handleViewSale = (sale: SaleWithDetails) => {
    setSelectedSale(sale);
    setDetailDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createSale")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("salesHistory")}</CardTitle>
              <CardDescription>{t("salesHistoryDescription")}</CardDescription>
            </div>
            {data && (
              <div className="text-sm text-muted-foreground">
                {t("totalSales", { count: data.total })}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : t("loadError")}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <SaleTable
              sales={data?.sales || []}
              onView={handleViewSale}
              locale={locale}
            />
          )}
        </CardContent>
      </Card>

      <SaleDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        sale={selectedSale}
        locale={locale}
      />
    </div>
  );
}
