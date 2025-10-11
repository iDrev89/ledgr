"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import type { BankWithRelations } from "@/lib/types/bank";

interface BankColumnsProps {
  onEdit: (bank: BankWithRelations) => void;
  onDelete: (bank: BankWithRelations) => void;
  t: (key: string) => string;
}

export const getBankColumns = ({
  onEdit,
  onDelete,
  t,
}: BankColumnsProps): ColumnDef<BankWithRelations>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "accountNo",
    header: t("accountNo"),
    cell: ({ row }) => {
      const accountNo = row.original.accountNo;
      return (
        <div className="text-muted-foreground">
          {accountNo || "-"}
        </div>
      );
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
    id: "payments",
    header: t("payments"),
    cell: ({ row }) => {
      const count = row.original._count;
      const total =
        (count?.salePayments || 0) +
        (count?.receivablePayments || 0) +
        (count?.purchasePayments || 0);
      return <div className="text-center">{total}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bank = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(bank)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(bank)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

