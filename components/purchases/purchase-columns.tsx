"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import type { SerializedPurchase } from "@/lib/types/purchases";
import { usePermissions } from "@/hooks/use-permissions";

export const createPurchaseColumns = (
  onView: (purchase: SerializedPurchase) => void,
  onDelete: (id: string) => void
): ColumnDef<SerializedPurchase>[] => {
  return [
    {
      accessorKey: "purchaseNumber",
      header: "N° Compra",
      cell: ({ row }) => {
        const purchaseNumber = row.getValue("purchaseNumber") as number | undefined;
        if (!purchaseNumber) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="font-mono font-semibold">
            #{String(purchaseNumber).padStart(4, "0")}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return format(date, "dd MMM yyyy", { locale: es });
      },
    },
    {
      accessorKey: "invoiceNo",
      header: "N° Factura",
      cell: ({ row }) => {
        const invoiceNo = row.getValue("invoiceNo") as string | null;
        return invoiceNo || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: "supplier.name",
      header: "Proveedor",
      cell: ({ row }) => {
        const supplier = row.original.supplier;
        return supplier ? (
          supplier.name
        ) : (
          <span className="text-muted-foreground">Sin proveedor</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusLabels: Record<string, string> = {
          APPROVED: "Aprobado",
          DRAFT: "Borrador",
          RECEIVED: "Recibido",
          CLOSED: "Cerrado",
          CANCELED: "Cancelado",
        };
        return (
          <Badge variant={status === "APPROVED" ? "default" : "secondary"}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items || [];
        return `${items.length} ${items.length === 1 ? "item" : "items"}`;
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(total);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const purchase = row.original;
        const { hasPermission } = usePermissions();
        const canDelete = hasPermission("purchases", "delete");

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(purchase)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(purchase.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};

