"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Supplier } from "@/prisma/prisma-client";

interface CreateSupplierColumnsProps {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  t: (key: string) => string;
}

export const createSupplierColumns = ({
  onEdit,
  onDelete,
  t,
}: CreateSupplierColumnsProps): ColumnDef<Supplier>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{supplier.name}</span>
          {supplier.taxId && (
            <span className="text-xs text-muted-foreground">
              {t("taxId")}: {supplier.taxId}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: t("email"),
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null;
      return email ? (
        <span className="text-sm">{email}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: t("phone"),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return phone ? (
        <span className="text-sm">{phone}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }) => {
      const supplier = row.original;

      return (
        <div className="flex justify-end">
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
              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(supplier)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

