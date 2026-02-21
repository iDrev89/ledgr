"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeftRight,
  Package,
  TrendingUp,
  TrendingDown,
  Settings,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductStock } from "@/hooks/use-inventory";
import { StockMoveType } from "@/prisma/prisma-client";
import type { Product } from "@/lib/types/product";

interface StockMovementHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  branchId?: string;
}

interface MovementWithRef {
  id: string;
  productId: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  moveType: StockMoveType;
  quantity: number;
  unitCost: string | null;
  refType: string | null;
  refId: string | null;
  note: string | null;
  createdAt: Date | string;
  refData?: {
    purchaseNumber?: number;
    saleNumber?: number;
  } | null;
}

const getMoveTypeIcon = (type: StockMoveType) => {
  switch (type) {
    case StockMoveType.PURCHASE:
      return <Package className="h-4 w-4" />;
    case StockMoveType.SALE:
      return <TrendingDown className="h-4 w-4" />;
    case StockMoveType.ADJUSTMENT:
      return <Settings className="h-4 w-4" />;
    case StockMoveType.TRANSFER:
      return <ArrowLeftRight className="h-4 w-4" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

const getMoveTypeColor = (type: StockMoveType) => {
  switch (type) {
    case StockMoveType.PURCHASE:
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case StockMoveType.SALE:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case StockMoveType.ADJUSTMENT:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case StockMoveType.TRANSFER:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
};

export function StockMovementHistory({
  open,
  onOpenChange,
  product,
  branchId,
}: StockMovementHistoryProps) {
  const t = useTranslations("Inventory");
  const { data, isLoading, error } = useProductStock(product?.id || "", branchId);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes =
      (now.getTime() - new Date(date).getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;

    if (diffInMinutes < 1) {
      return t("justNow");
    } else if (diffInMinutes < 60) {
      return t("minutesAgo", { minutes: Math.floor(diffInMinutes) });
    } else if (diffInHours < 24) {
      return t("hoursAgo", { hours: Math.floor(diffInHours) });
    } else if (diffInHours < 48) {
      return t("yesterday");
    } else if (diffInHours < 168) {
      return t("daysAgo", { days: Math.floor(diffInHours / 24) });
    } else {
      return format(new Date(date), "PPP", { locale: es });
    }
  };

  const formatQuantity = (quantity: number, moveType: StockMoveType) => {
    if (moveType === StockMoveType.SALE) {
      return `-${Math.abs(quantity)}`;
    }
    return quantity > 0 ? `+${quantity}` : quantity.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("historyTitle")}</DialogTitle>
          <DialogDescription>
            {product && (
              <>
                <span className="font-medium text-foreground">
                  {product.name}
                </span>
                {product.sku && (
                  <span className="text-muted-foreground ml-2">
                    SKU: {product.sku}
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : t("loadError")}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : data?.movements && data.movements.length > 0 ? (
            <div className="space-y-3">
              {data.movements.map((movement, index) => {
                const isPositive =
                  movement.moveType === StockMoveType.PURCHASE ||
                  (movement.moveType === StockMoveType.ADJUSTMENT &&
                    movement.quantity > 0) ||
                  (movement.moveType === StockMoveType.TRANSFER &&
                    movement.quantity > 0);

                return (
                  <div
                    key={movement.id}
                    className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getMoveTypeColor(
                        movement.moveType,
                      )}`}
                    >
                      {getMoveTypeIcon(movement.moveType)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {t(
                            `move${movement.moveType.charAt(0) + movement.moveType.slice(1).toLowerCase()}`,
                          )}
                        </span>
                      </div>

                      {movement.note && (
                        <p className="text-sm text-muted-foreground">
                          {movement.note}
                        </p>
                      )}

                      {(movement as MovementWithRef).branch && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {(movement as MovementWithRef).branch!.name}
                        </Badge>
                      )}

                      {movement.refType && movement.refId && (
                        <div className="text-xs text-muted-foreground">
                          {t("reference")}:
                          {movement.refType === "Purchase" &&
                          movement.refData?.purchaseNumber
                            ? ` Compra #${String(movement.refData.purchaseNumber).padStart(4, "0")}`
                            : movement.refType === "Sale" &&
                                movement.refData?.saleNumber
                              ? ` Venta #${String(movement.refData.saleNumber).padStart(4, "0")}`
                              : ` ${movement.refType}-${movement.refId.substring(0, 8)}`}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <span
                          className={`font-bold ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatQuantity(movement.quantity, movement.moveType)}{" "}
                          {t("units")}
                        </span>
                        {movement.unitCost && (
                          <span className="text-muted-foreground">
                            @ $
                            {parseFloat(movement.unitCost.toString()).toFixed(
                              2,
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(movement.createdAt)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {t("balance")}:{" "}
                        {data.currentStock -
                          data.movements.slice(0, index).reduce((acc, m) => {
                            if (m.moveType === StockMoveType.SALE)
                              return acc - Math.abs(m.quantity);
                            return acc + m.quantity;
                          }, 0)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">{t("noMovements")}</p>
            </div>
          )}
        </ScrollArea>

        {data && (
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {t("currentStock")}:
              </span>
              <span className="ml-2 text-lg font-bold">
                {data.currentStock}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t("totalMovements", { count: data.movements.length })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
