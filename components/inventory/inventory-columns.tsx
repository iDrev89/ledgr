"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductStock } from "@/lib/types/inventory";

export type InventoryColumnActions = {
  onAdjust: (item: ProductStock) => void;
  onViewHistory: (item: ProductStock) => void;
  canAdjust?: boolean;
  t: (key: string) => string;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("es-CO").format(value);
};

export const createInventoryColumns = (
  actions: InventoryColumnActions
): ColumnDef<ProductStock>[] => [
  {
    id: "productName",
    accessorKey: "product.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {actions.t("productName")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          {product.sku && (
            <span className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "currentStock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {actions.t("currentStock")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = row.getValue("currentStock") as number;
      return <span className="font-medium text-lg">{formatNumber(stock)}</span>;
    },
  },
  {
    id: "status",
    header: actions.t("status"),
    cell: ({ row }) => {
      const stock = row.original.currentStock;
      return (
        <div className="flex items-center gap-2">
          {stock > 10 ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">{actions.t("inStock")}</span>
            </>
          ) : stock > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600 font-medium">{actions.t("lowStock")}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">{actions.t("outOfStock")}</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{actions.t("actions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{actions.t("actions")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onViewHistory(item)}>
              <History className="mr-2 h-4 w-4" />
              {actions.t("history")}
            </DropdownMenuItem>
            {actions.canAdjust && (
              <DropdownMenuItem onClick={() => actions.onAdjust(item)}>
                <Settings className="mr-2 h-4 w-4" />
                {actions.t("adjust")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

