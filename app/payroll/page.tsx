"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PayrollRunTable } from "@/components/payroll/payroll-run-table";
import { PayrollRunDialog } from "@/components/payroll/payroll-run-dialog";
import { PayrollRunDetailDialog } from "@/components/payroll/payroll-run-detail-dialog";
import { PayrollRunPaymentDialog } from "@/components/payroll/payroll-run-payment-dialog";
import {
  usePayrollRuns,
  useCreatePayrollRun,
  useFinalizePayrollRun,
  usePayPayrollRun,
  useDeletePayrollRun,
} from "@/hooks/use-payroll";
import type { PayrollRunWithDetails } from "@/lib/types/payroll";
import type { CreatePayrollRunInput } from "@/lib/validations/payroll";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";

export default function PayrollPage() {
  const t = useTranslations("Payroll");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRunWithDetails | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<PayrollRunWithDetails | null>(
    null,
  );
  const [finalizeConfirmOpen, setFinalizeConfirmOpen] = useState(false);
  const [runToFinalize, setRunToFinalize] =
    useState<PayrollRunWithDetails | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [runToPay, setRunToPay] = useState<PayrollRunWithDetails | null>(null);

  const { data, isLoading } = usePayrollRuns();
  const createMutation = useCreatePayrollRun();
  const finalizeMutation = useFinalizePayrollRun();
  const payMutation = usePayPayrollRun();
  const deleteMutation = useDeletePayrollRun();

  const runs = data?.runs || [];

  const handleCreate = async (
    input: CreatePayrollRunInput & { userIds?: string[] },
  ) => {
    await createMutation.mutateAsync(input);
  };

  const handleView = (run: PayrollRunWithDetails) => {
    setSelectedRun(run);
    setDetailDialogOpen(true);
  };

  const handleFinalize = (run: PayrollRunWithDetails) => {
    setRunToFinalize(run);
    setFinalizeConfirmOpen(true);
  };

  const handleConfirmFinalize = async () => {
    if (!runToFinalize) return;
    await finalizeMutation.mutateAsync(runToFinalize.id);
    setFinalizeConfirmOpen(false);
    setRunToFinalize(null);
  };

  const handlePay = (run: PayrollRunWithDetails) => {
    setRunToPay(run);
    setPayDialogOpen(true);
  };

  const handleConfirmPay = async (
    payments: { userId: string; amount: string }[],
  ) => {
    if (!runToPay) return;
    await payMutation.mutateAsync({ id: runToPay.id, payments });
    setPayDialogOpen(false);
    setRunToPay(null);
  };

  const handleDelete = (run: PayrollRunWithDetails) => {
    setRunToDelete(run);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!runToDelete) return;
    await deleteMutation.mutateAsync(runToDelete.id);
    setDeleteConfirmOpen(false);
    setRunToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        pageTitle={t("title")}
        pageDes={t("description")}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createRun")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <PayrollRunTable
          runs={runs}
          onView={handleView}
          onFinalize={handleFinalize}
          onPay={handlePay}
          onDelete={handleDelete}
        />
      )}

      {/* Create Dialog */}
      <PayrollRunDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Detail Dialog */}
      <PayrollRunDetailDialog
        run={selectedRun}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Payment Dialog */}
      <PayrollRunPaymentDialog
        run={runToPay}
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        onSubmit={handleConfirmPay}
        isLoading={payMutation.isPending}
      />

      {/* Finalize Confirmation */}
      <AlertDialog
        open={finalizeConfirmOpen}
        onOpenChange={setFinalizeConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("finalizeRun")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("finalizeDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFinalize}>
              {t("finalize")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteRun")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
