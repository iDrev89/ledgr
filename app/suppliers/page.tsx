"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SupplierTable } from "@/components/suppliers/supplier-table";
import { SupplierDialog } from "@/components/suppliers/supplier-dialog";
import { useSuppliers } from "@/hooks/use-suppliers";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Supplier } from "@/prisma/prisma-client";

export default function SuppliersPage() {
  const t = useTranslations("Suppliers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    Supplier | undefined
  >();

  const { data, isLoading, error } = useSuppliers();

  const handleCreate = () => {
    setSelectedSupplier(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSupplier(undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createSupplier")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("supplierList")}</CardTitle>
              <CardDescription>{t("supplierListDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : t("loadError")}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <SupplierTable
              suppliers={data?.suppliers || []}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      <SupplierDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        supplier={selectedSupplier}
      />
    </div>
  );
}
