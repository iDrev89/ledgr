"use client";

import { Pencil, Trash2, Mail, Phone, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Customer } from "@/lib/types/customer";
import { useTranslations } from "next-intl";

interface CustomerCardProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  const t = useTranslations("Customers");

  return (
    <Card
      className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Nombre + Acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{customer.name}</h3>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Información de Contacto */}
        <div className="space-y-2">
          {customer.email ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{customer.email}</span>
            </div>
          ) : null}
          
          {customer.phone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{customer.phone}</span>
            </div>
          ) : null}

          {!customer.email && !customer.phone && (
            <p className="text-xs text-muted-foreground">{t("noContact")}</p>
          )}
        </div>

        <Separator />

        {/* Detalles */}
        <div className="space-y-2">
          {/* Documento */}
          {customer.docId && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <Badge variant="outline" className="font-normal">
                {customer.docId}
              </Badge>
            </div>
          )}

          {/* Total de Ventas (si está disponible) - Disabled: property not in schema */}
          {/* {customer.totalSales !== undefined && customer.totalSales > 0 && (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t("totalSales")}</p>
                <p className="text-sm font-medium">
                  {formatCurrency(customer.totalSales)}
                </p>
              </div>
            </div>
          )} */}
        </div>

        {/* Nota (si existe) */}
        {customer.note && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-md p-2">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {customer.note}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

