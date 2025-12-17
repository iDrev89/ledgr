"use client";

import { Edit, Trash2, Mail, Phone, FileText, Building } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Supplier } from "@/prisma/prisma-client";

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierCard({
  supplier,
  onEdit,
  onDelete,
}: SupplierCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-3">
        {/* Name */}
        <div>
          <h3 className="font-semibold text-lg">{supplier.name}</h3>
          {supplier.taxId && (
            <div className="flex items-center gap-2 mt-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {supplier.taxId}
              </span>
            </div>
          )}
        </div>

        {/* Email */}
        {supplier.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{supplier.email}</span>
          </div>
        )}

        {/* Phone */}
        {supplier.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{supplier.phone}</span>
          </div>
        )}

        {/* Address */}
        {supplier.address && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{supplier.address}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(supplier)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(supplier)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
