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
import type { AccountWithRelations } from "@/lib/types/account";
import { AccountType } from "@/prisma/prisma-client";

interface AccountColumnsProps {
  onEdit: (account: AccountWithRelations) => void;
  onDelete: (account: AccountWithRelations) => void;
  t: (key: string) => string;
}

export const getAccountColumns = ({
  onEdit,
  onDelete,
  t,
}: AccountColumnsProps): ColumnDef<AccountWithRelations>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "type",
    header: t("type"),
    cell: ({ row }) => {
      const type = row.getValue("type") as AccountType;
      const typeLabels: Record<string, string> = {
        [AccountType.BANK]: t("typeBankLabel"),
        [AccountType.CASH_REGISTER]: t("typeCashRegister"),
        [AccountType.PETTY_CASH]: t("typePettyCash"),
        [AccountType.DIGITAL_WALLET]: t("typeDigitalWallet"),
        [AccountType.CREDIT_LINE]: t("typeCreditLine"),
      };
      return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
    },
  },
  {
    accessorKey: "accountNumber",
    header: t("accountNumber"),
    cell: ({ row }) => {
      const accountNumber = row.original.accountNumber;
      return <div className="text-muted-foreground">{accountNumber || "-"}</div>;
    },
  },
  {
    id: "balance",
    header: t("balance"),
    cell: ({ row }) => {
      const account = row.original as any;
      const balance = account.currentBalance || 0;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(amount);
      };
      return <div className="font-semibold">{formatCurrency(balance)}</div>;
    },
  },
  {
    id: "transactions",
    header: t("transactions"),
    cell: ({ row }) => {
      const account = row.original as any;
      const count = account.transactionCount || 0;
      return <div className="text-center text-muted-foreground">{count}</div>;
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
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(account)}
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
