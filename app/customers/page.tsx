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
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { useCustomers } from "@/hooks/use-customers";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Customer } from "@/lib/types/customer";

export default function CustomersPage() {
  const t = useTranslations("Customers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();

  const { data, isLoading, error } = useCustomers();

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCustomer(undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("createCustomer")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("customerList")}</CardTitle>
              <CardDescription>{t("customerListDescription")}</CardDescription>
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
            <CustomerTable
              customers={data?.customers || []}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        customer={selectedCustomer}
      />
    </div>
  );
}
