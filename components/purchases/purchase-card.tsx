"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, Trash2, Package, Calendar, FileText, User } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SerializedPurchase } from "@/lib/types/purchases";
import { usePermissions } from "@/hooks/use-permissions";

interface PurchaseCardProps {
  purchase: SerializedPurchase;
  onView: (purchase: SerializedPurchase) => void;
  onDelete: (id: string) => void;
}

export function PurchaseCard({
  purchase,
  onView,
  onDelete,
}: PurchaseCardProps) {
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission("purchases", "delete");

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {purchase.purchaseNumber ? (
              <span className="text-lg font-mono font-semibold">
                #{String(purchase.purchaseNumber).padStart(4, "0")}
              </span>
            ) : (
              <span className="text-lg font-semibold text-muted-foreground">
                Sin número
              </span>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {format(new Date(purchase.createdAt), "dd MMM yyyy", {
                  locale: es,
                })}
              </span>
            </div>
          </div>
          <Badge
            variant={purchase.status === "APPROVED" ? "default" : "secondary"}
          >
            {purchase.status === "APPROVED" ? "Aprobado" : purchase.status}
          </Badge>
        </div>

        {/* Invoice No */}
        {purchase.invoiceNo && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{purchase.invoiceNo}</span>
          </div>
        )}

        {/* Supplier */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {purchase.supplier ? purchase.supplier.name : "Sin proveedor"}
          </span>
        </div>

        {/* Items */}
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {purchase.items?.length || 0}{" "}
            {(purchase.items?.length || 0) === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Total */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">
              {formatCurrency(purchase.total)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(purchase)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalle
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(purchase.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
