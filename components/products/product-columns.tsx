"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Package,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/lib/types/product";
import { ProductType } from "@/prisma/prisma-client";

export type ProductColumnActions = {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  t: (key: string) => string;
};

const formatCurrency = (value: number | string) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

export const createProductColumns = (
  actions: ProductColumnActions
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {actions.t("name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              product.type === ProductType.PRODUCT
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            }`}
          >
            {product.type === ProductType.PRODUCT ? (
              <Package className="h-5 w-5" />
            ) : (
              <Wrench className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            {product.sku && (
              <span className="text-xs text-muted-foreground">
                SKU: {product.sku}
              </span>
            )}
            {product.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {product.description}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: actions.t("type"),
    cell: ({ row }) => {
      const type = row.getValue("type") as ProductType;
      return (
        <Badge variant={type === ProductType.PRODUCT ? "default" : "secondary"}>
          {actions.t(
            type === ProductType.PRODUCT ? "typeProduct" : "typeService"
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {actions.t("price")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as string;
      return <span className="font-medium">{formatCurrency(price)}</span>;
    },
  },
  {
    accessorKey: "cost",
    header: actions.t("cost"),
    cell: ({ row }) => {
      const cost = row.getValue("cost") as string | null;
      return cost ? (
        <span className="text-muted-foreground">{formatCurrency(cost)}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "active",
    header: actions.t("status"),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "default" : "outline"}>
          {active ? actions.t("active") : actions.t("inactive")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

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
            <DropdownMenuItem onClick={() => actions.onEdit(product)}>
              <Pencil className="mr-2 h-4 w-4" />
              {actions.t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onDelete(product)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {actions.t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
