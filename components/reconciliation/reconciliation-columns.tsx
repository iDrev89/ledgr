"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
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
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { ReconciliationWithRelations } from "@/lib/types/reconciliation";
import { cn } from "@/lib/utils";

interface CreateReconciliationColumnsProps {
  onView: (reconciliation: ReconciliationWithRelations) => void;
  onDelete: (reconciliation: ReconciliationWithRelations) => void;
  t: (key: string) => string;
  locale?: string;
}

const formatCurrency = (value: unknown) => {
  const numValue = Number(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numValue);
};

const statusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default" as const;
    case "IN_PROGRESS":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

const statusClassName = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "";
  }
};

export const createReconciliationColumns = ({
  onView,
  onDelete,
  t,
  locale = "es",
}: CreateReconciliationColumnsProps): ColumnDef<ReconciliationWithRelations>[] => [
  {
    accessorKey: "account.name",
    header: t("account"),
    cell: ({ row }) => {
      const accountName = row.original.account?.name;
      return <div className="font-medium">{accountName}</div>;
    },
  },
  {
    id: "period",
    header: t("period"),
    cell: ({ row }) => {
      const dateLocale = locale === "es" ? es : enUS;
      const start = new Date(row.original.periodStart);
      const end = new Date(row.original.periodEnd);
      return (
        <div className="text-sm text-muted-foreground">
          {format(start, "dd/MM/yyyy", { locale: dateLocale })} –{" "}
          {format(end, "dd/MM/yyyy", { locale: dateLocale })}
        </div>
      );
    },
  },
  {
    accessorKey: "openingBalance",
    header: () => <div className="text-right">{t("openingBalance")}</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.openingBalance)}
      </div>
    ),
  },
  {
    accessorKey: "closingBalance",
    header: () => <div className="text-right">{t("closingBalance")}</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.closingBalance)}
      </div>
    ),
  },
  {
    accessorKey: "statementBalance",
    header: () => <div className="text-right">{t("statementBalance")}</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.statementBalance)}
      </div>
    ),
  },
  {
    accessorKey: "difference",
    header: () => <div className="text-right">{t("difference")}</div>,
    cell: ({ row }) => {
      const diff = Number(row.original.difference);
      return (
        <div
          className={cn(
            "text-right font-medium",
            diff === 0 ? "text-green-600" : "text-red-600",
          )}
        >
          {formatCurrency(diff)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: t("status"),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={statusVariant(status)}
          className={statusClassName(status)}
        >
          {t(`status_${status}`)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => {
      const reconciliation = row.original;

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
            <DropdownMenuItem onClick={() => onView(reconciliation)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(reconciliation)}
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
