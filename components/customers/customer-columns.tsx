"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  ArrowUpDown,
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
import type { Customer } from "@/lib/types/customer";

export type CustomerColumnActions = {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  t: (key: string) => string;
};

export const createCustomerColumns = (
  actions: CustomerColumnActions
): ColumnDef<Customer>[] => [
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
      const customer = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{customer.name}</span>
          {customer.note && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {customer.note}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: actions.t("contact"),
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex flex-col gap-1">
          {customer.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{customer.phone}</span>
            </div>
          )}
          {!customer.email && !customer.phone && (
            <span className="text-xs text-muted-foreground">
              {actions.t("noContact")}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "docId",
    header: actions.t("docId"),
    cell: ({ row }) => {
      const docId = row.getValue("docId") as string | null;
      return docId ? (
        <Badge variant="outline">{docId}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

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
            <DropdownMenuItem onClick={() => actions.onEdit(customer)}>
              <Pencil className="mr-2 h-4 w-4" />
              {actions.t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onDelete(customer)}
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
