"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import { ReconciliationTable } from "@/components/reconciliation/reconciliation-table";
import { ReconciliationDialog } from "@/components/reconciliation/reconciliation-dialog";
import { ReconciliationDetailDialog } from "@/components/reconciliation/reconciliation-detail-dialog";
import { useReconciliations } from "@/hooks/use-reconciliation";
import type { ReconciliationWithRelations } from "@/lib/types/reconciliation";

export default function ReconciliationPage() {
  const t = useTranslations("Reconciliation");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] =
    useState<ReconciliationWithRelations | null>(null);

  const { data, isLoading, error } = useReconciliations();

  const handleView = (reconciliation: ReconciliationWithRelations) => {
    setSelectedReconciliation(reconciliation);
    setDetailDialogOpen(true);
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
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("newReconciliation")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("reconciliations")}</CardTitle>
          <CardDescription>
            {t("reconciliationsDescription")}
          </CardDescription>
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
            <ReconciliationTable
              reconciliations={data?.reconciliations || []}
              onView={handleView}
            />
          )}
        </CardContent>
      </Card>

      <ReconciliationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ReconciliationDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        reconciliation={selectedReconciliation}
      />
    </div>
  );
}
