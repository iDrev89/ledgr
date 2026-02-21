"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CashCloseWithRelations } from "@/lib/types/cash-close";
import { cn } from "@/lib/utils";

interface CreateCashCloseColumnsProps {
  onDelete: (cashClose: CashCloseWithRelations) => void;
  t: (key: string) => string;
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numValue);
};

const getDifferenceColor = (difference: number) => {
  if (difference === 0) return "text-green-600";
  if (difference < 0) return "text-red-600";
  return "text-yellow-600";
};

export const createCashCloseColumns = ({
  onDelete,
  t,
}: CreateCashCloseColumnsProps): ColumnDef<CashCloseWithRelations>[] => [
  {
    accessorKey: "closeDate",
    header: t("closeDate"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("closeDate"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "accountName",
    header: t("account"),
    cell: ({ row }) => {
      const account = row.original.account;
      return <div className="text-sm font-medium">{account.name}</div>;
    },
  },
  {
    id: "branchName",
    header: t("branch"),
    cell: ({ row }) => {
      const branch = row.original.branch;
      return (
        <div className="text-sm text-muted-foreground">
          {branch?.name || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "expectedBalance",
    header: () => <div className="text-right">{t("expectedBalance")}</div>,
    cell: ({ row }) => {
      const value = row.getValue("expectedBalance");
      return (
        <div className="text-right text-sm">
          {formatCurrency(Number(value))}
        </div>
      );
    },
  },
  {
    accessorKey: "actualBalance",
    header: () => <div className="text-right">{t("actualBalance")}</div>,
    cell: ({ row }) => {
      const value = row.getValue("actualBalance");
      return (
        <div className="text-right text-sm font-medium">
          {formatCurrency(Number(value))}
        </div>
      );
    },
  },
  {
    accessorKey: "difference",
    header: () => <div className="text-right">{t("difference")}</div>,
    cell: ({ row }) => {
      const value = Number(row.getValue("difference"));
      return (
        <div
          className={cn(
            "text-right text-sm font-semibold",
            getDifferenceColor(value)
          )}
        >
          {formatCurrency(value)}
        </div>
      );
    },
  },
  {
    id: "closedByName",
    header: t("closedBy"),
    cell: ({ row }) => {
      const closedBy = row.original.closedBy;
      return <div className="text-sm text-muted-foreground">{closedBy.name}</div>;
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => {
      const cashClose = row.original;

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
            <DropdownMenuItem
              onClick={() => onDelete(cashClose)}
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
