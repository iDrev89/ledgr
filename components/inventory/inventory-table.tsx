"use client";

import { useTranslations } from "next-intl";
import type { ProductStock } from "@/lib/types/inventory";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { InventoryCard } from "./inventory-card";
import { createInventoryColumns } from "./inventory-columns";

interface InventoryTableProps {
  inventory: ProductStock[];
  onAdjust: (item: ProductStock) => void;
  onViewHistory: (item: ProductStock) => void;
  canAdjust?: boolean;
}

export function InventoryTable({
  inventory,
  onAdjust,
  onViewHistory,
  canAdjust = true,
}: InventoryTableProps) {
  const t = useTranslations("Inventory");

  const columns = createInventoryColumns({
    onAdjust,
    onViewHistory,
    canAdjust,
    t,
  });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(item) => (
        <InventoryCard
          item={item}
          onAdjust={() => onAdjust(item)}
          onViewHistory={() => onViewHistory(item)}
          canAdjust={canAdjust}
        />
      )}
      data={inventory}
      searchKey="productName"
      searchPlaceholder={t("searchPlaceholder")}
      showPagination
      pageSize={10}
      emptyMessage={t("noInventory")}
    />
  );
}
