"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";

interface CreateCategoryColumnsProps {
  onEdit: (category: ProductCategoryWithRelations) => void;
  onDelete: (category: ProductCategoryWithRelations) => void;
  t: (key: string) => string;
}

export const createCategoryColumns = ({
  onEdit,
  onDelete,
  t,
}: CreateCategoryColumnsProps): ColumnDef<ProductCategoryWithRelations>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "active",
    header: t("status"),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? t("active") : t("inactive")}
        </Badge>
      );
    },
  },
  {
    id: "usage",
    header: t("usage"),
    cell: ({ row }) => {
      const count = row.original._count;
      const total = count?.products || 0;
      return (
        <div className="text-sm text-muted-foreground">
          {total} {t("products")}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t("openMenu")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
