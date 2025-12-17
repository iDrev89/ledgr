"use client";

import { useTranslations } from "next-intl";
import type { ProductStock } from "@/lib/types/inventory";
import { DataTable } from "@/components/ui/data-table";
import { createInventoryColumns } from "./inventory-columns";

interface InventoryTableProps {
  inventory: ProductStock[];
  onAdjust: (item: ProductStock) => void;
  onViewHistory: (item: ProductStock) => void;
  canAdjust?: boolean;
}

export function InventoryTable({ inventory, onAdjust, onViewHistory, canAdjust = true }: InventoryTableProps) {
  const t = useTranslations("Inventory");

  const columns = createInventoryColumns({
    onAdjust,
    onViewHistory,
    canAdjust,
    t,
  });

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noInventory")}</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={inventory}
      searchKey="productName"
      searchPlaceholder={t("searchPlaceholder")}
      showPagination
      pageSize={10}
    />
  );
}

