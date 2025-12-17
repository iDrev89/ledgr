"use client";

import { PurchaseTable } from "@/components/purchases/purchase-table";
import { usePurchases } from "@/hooks/use-purchases";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function PurchasesTableClient() {
  const t = useTranslations("Purchases");
  const { data, isLoading, error } = usePurchases();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">{t("loadError")}</p>
      </div>
    );
  }

  return <PurchaseTable purchases={data?.purchases || []} />;
}

