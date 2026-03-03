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
import { MoreHorizontal, Pencil, Trash, Star } from "lucide-react";
import type { BranchWithRelations } from "@/lib/types/branch";

interface BranchColumnsProps {
  onEdit: (branch: BranchWithRelations) => void;
  onDelete: (branch: BranchWithRelations) => void;
  t: (key: string) => string;
}

export const getBranchColumns = ({
  onEdit,
  onDelete,
  t,
}: BranchColumnsProps): ColumnDef<BranchWithRelations>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      const branch = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
          {(branch as any).isDefault && (
            <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
              <Star className="h-3 w-3 fill-amber-500" />
              {t("default")}
            </Badge>
          )}
        </div>
      );
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
    accessorKey: "address",
    header: t("address"),
    cell: ({ row }) => {
      const address = row.original.address;
      return <div className="text-muted-foreground truncate max-w-[200px]">{address || "-"}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: t("phone"),
    cell: ({ row }) => {
      const phone = row.original.phone;
      return <div className="text-muted-foreground">{phone || "-"}</div>;
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
    id: "users",
    header: t("users"),
    cell: ({ row }) => {
      const count = row.original._count?.users || 0;
      return <div className="text-center text-muted-foreground">{count}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const branch = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(branch)}
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
