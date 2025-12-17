import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PurchasesTableClient } from "./purchases-table-client";

export default function PurchasesPage() {
  const t = useTranslations("Purchases");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Link href="/purchases/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("newPurchase")}
          </Button>
        </Link>
      </div>

      {/* Purchases Table */}
      <PurchasesTableClient />
    </div>
  );
}
