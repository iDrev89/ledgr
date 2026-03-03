"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Eye } from "lucide-react";
import type { CashSessionWithRelations } from "@/lib/types/cash-session";

const formatCurrency = (value: string | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
};

interface CreateCashSessionColumnsProps {
  onView: (session: CashSessionWithRelations) => void;
  onDelete: (session: CashSessionWithRelations) => void;
}

export const createCashSessionColumns = ({
  onView,
  onDelete,
}: CreateCashSessionColumnsProps): ColumnDef<CashSessionWithRelations>[] => {
  const t = useTranslations("CashRegister");

  return [
    {
      accessorKey: "openedAt",
      header: t("openedAt"),
      cell: ({ row }) =>
        new Date(row.original.openedAt).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      accessorKey: "account",
      header: t("account"),
      cell: ({ row }) => row.original.account.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isOpen = row.original.status === "OPEN";
        return (
          <Badge variant={isOpen ? "default" : "secondary"}>
            {isOpen ? t("statusOpen") : t("statusClosed")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "openingBalance",
      header: t("openingBalance"),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatCurrency(row.original.openingBalance)}
        </span>
      ),
    },
    {
      accessorKey: "actualBalance",
      header: t("actualBalance"),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatCurrency(row.original.actualBalance)}
        </span>
      ),
    },
    {
      accessorKey: "difference",
      header: t("difference"),
      cell: ({ row }) => {
        const diff = row.original.difference;
        if (!diff) return <span className="text-muted-foreground">—</span>;
        const num = parseFloat(diff);
        const colorClass =
          num === 0
            ? "text-success"
            : num < 0
              ? "text-destructive"
              : "text-warning";
        return (
          <span className={`font-mono tabular-nums ${colorClass}`}>
            {formatCurrency(diff)}
          </span>
        );
      },
    },
    {
      accessorKey: "openedBy",
      header: t("openedBy"),
      cell: ({ row }) => row.original.openedBy.name,
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const session = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("openMenu")}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(session)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("sessionDetail")}
              </DropdownMenuItem>
              {session.status === "OPEN" && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(session)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
