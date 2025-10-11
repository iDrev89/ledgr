"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { BankTable } from "@/components/banks/bank-table";
import { BankDialog } from "@/components/banks/bank-dialog";
import { useBanks, useDeleteBank } from "@/hooks/use-banks";
import type { BankWithRelations } from "@/lib/types/bank";
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

export default function BanksPage() {
  const t = useTranslations("Banks");
  const [selectedBank, setSelectedBank] = useState<BankWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<BankWithRelations | null>(null);

  const { data, isLoading, error } = useBanks();
  const deleteMutation = useDeleteBank();

  const handleCreate = () => {
    setSelectedBank(null);
    setDialogOpen(true);
  };

  const handleEdit = (bank: BankWithRelations) => {
    setSelectedBank(bank);
    setDialogOpen(true);
  };

  const handleDelete = (bank: BankWithRelations) => {
    setBankToDelete(bank);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bankToDelete) return;

    try {
      await deleteMutation.mutateAsync(bankToDelete.id);
      toast.success(t("deleteSuccess"));
      setDeleteDialogOpen(false);
      setBankToDelete(null);
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        pageTitle={t("title")}
        pageDes={t("description")}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("banksTitle")}</CardTitle>
              <CardDescription>{t("banksDescription")}</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t("createBank")}
            </Button>
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
            <BankTable
              banks={data?.banks || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          )}
        </CardContent>
      </Card>

      <BankDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bank={selectedBank}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", { name: bankToDelete?.name || "" })}
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

