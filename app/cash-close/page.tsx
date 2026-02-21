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
import { CashCloseTable } from "@/components/cash-close/cash-close-table";
import { CashCloseDialog } from "@/components/cash-close/cash-close-dialog";
import { useCashCloses } from "@/hooks/use-cash-close";

export default function CashClosePage() {
  const t = useTranslations("CashClose");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useCashCloses();

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
          {t("newCashClose")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("cashCloses")}</CardTitle>
          <CardDescription>{t("cashClosesDescription")}</CardDescription>
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
            <CashCloseTable cashCloses={data?.cashCloses || []} />
          )}
        </CardContent>
      </Card>

      <CashCloseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
