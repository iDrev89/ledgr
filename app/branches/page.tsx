"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { BranchTable } from "@/components/branches/branch-table";
import { BranchDialog } from "@/components/branches/branch-dialog";
import { useBranches, useDeleteBranch } from "@/hooks/use-branches";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/ui/search-input";
import type { BranchWithRelations } from "@/lib/types/branch";
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

export default function BranchesPage() {
  const t = useTranslations("Branches");

  const [selectedBranch, setSelectedBranch] =
    useState<BranchWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] =
    useState<BranchWithRelations | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: branchesData,
    isLoading,
    error,
    isFetching,
  } = useBranches({
    search: debouncedSearch || undefined,
  });
  const isSearching = isFetching && !isLoading;

  const deleteMutation = useDeleteBranch();

  const handleCreate = () => {
    setSelectedBranch(null);
    setDialogOpen(true);
  };

  const handleEdit = (branch: BranchWithRelations) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  const handleDelete = (branch: BranchWithRelations) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;

    try {
      await deleteMutation.mutateAsync(branchToDelete.id);
      toast.success(t("deleteSuccess"));
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    } catch (error) {
      toast.error(t("deleteError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
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
          {t("createBranch")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t("branches")}</CardTitle>
              <CardDescription>{t("branchesDescription")}</CardDescription>
            </div>
            <div className="w-full md:w-auto md:min-w-[300px]">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t("searchPlaceholder")}
                isLoading={isSearching}
              />
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
            <BranchTable
              branches={branchesData?.branches || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          )}
        </CardContent>
      </Card>

      <BranchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={selectedBranch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", {
                name: branchToDelete?.name || "",
              })}
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