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
import type { BusinessLineWithRelations } from "@/lib/types/business-line";

interface BusinessLineColumnsProps {
  onEdit: (businessLine: BusinessLineWithRelations) => void;
  onDelete: (businessLine: BusinessLineWithRelations) => void;
  t: (key: string) => string;
}

export const getBusinessLineColumns = ({
  onEdit,
  onDelete,
  t,
}: BusinessLineColumnsProps): ColumnDef<BusinessLineWithRelations>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "code",
    header: t("code"),
    cell: ({ row }) => {
      const code = row.original.code;
      return (
        <div className="text-muted-foreground font-mono">{code || "-"}</div>
      );
    },
  },
  {
    accessorKey: "color",
    header: t("color"),
    cell: ({ row }) => {
      const color = row.original.color;
      if (!color) return <div className="text-muted-foreground">-</div>;
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border border-border"
            style={{ backgroundColor: color }}
          />
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
    id: "actions",
    cell: ({ row }) => {
      const businessLine = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(businessLine)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(businessLine)}
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
