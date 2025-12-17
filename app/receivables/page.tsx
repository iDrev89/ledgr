"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { ReceivableTable } from "@/components/receivables/receivable-table";
import { ReceivableDetailDialog } from "@/components/receivables/receivable-detail-dialog";
import { ReceivablePaymentDialog } from "@/components/receivables/receivable-payment-dialog";
import { useReceivables, useCancelReceivable } from "@/hooks/use-receivables";
import type { ReceivableWithDetails } from "@/lib/types/receivables";

type FilterType = "all" | "pending";

export default function ReceivablesPage() {
  const t = useTranslations("Receivables");
  const locale = useLocale();
  const [selectedReceivable, setSelectedReceivable] =
    useState<ReceivableWithDetails | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const { data, isLoading, error } = useReceivables();
  const cancelMutation = useCancelReceivable();

  // Filter receivables based on selected filter
  const filteredReceivables = useMemo(() => {
    if (!data?.receivables) return [];

    if (filter === "pending") {
      return data.receivables.filter(
        (r) => r.status === "OPEN" || r.status === "PARTIAL",
      );
    }

    return data.receivables;
  }, [data?.receivables, filter]);

  const handleView = (receivable: ReceivableWithDetails) => {
    setSelectedReceivable(receivable);
    setDetailDialogOpen(true);
  };

  const handlePayment = (receivable: ReceivableWithDetails) => {
    setSelectedReceivable(receivable);
    setPaymentDialogOpen(true);
  };

  const handleCancel = (receivable: ReceivableWithDetails) => {
    setSelectedReceivable(receivable);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReceivable) return;

    try {
      await cancelMutation.mutateAsync(selectedReceivable.id);
      toast.success(t("cancelSuccess"));
      setCancelDialogOpen(false);
      setSelectedReceivable(null);
    } catch (error) {
      toast.error(t("cancelError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const totalBalance =
    data?.receivables.reduce((sum, r) => sum + parseFloat(r.balance), 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader pageTitle={t("title")} pageDes={t("description")} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalReceivables")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalBalance.toString())}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("openReceivables")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.receivables.filter(
                (r) => r.status === "OPEN" || r.status === "PARTIAL",
              ).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t("receivablesList")}</CardTitle>
              <CardDescription>
                {t("receivablesListDescription")}
              </CardDescription>
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterType)}
            >
              <TabsList>
                <TabsTrigger value="all">{t("filterAll")}</TabsTrigger>
                <TabsTrigger value="pending">{t("filterPending")}</TabsTrigger>
              </TabsList>
            </Tabs>
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
            <ReceivableTable
              receivables={filteredReceivables}
              onView={handleView}
              onPayment={handlePayment}
              onCancel={handleCancel}
              t={t}
              locale={locale}
            />
          )}
        </CardContent>
      </Card>

      <ReceivableDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        receivable={selectedReceivable}
        locale={locale}
      />

      <ReceivablePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        receivable={selectedReceivable}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("confirmCancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
