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
import { BusinessLineTable } from "@/components/business-lines/business-line-table";
import { BusinessLineDialog } from "@/components/business-lines/business-line-dialog";
import {
  useBusinessLines,
  useDeleteBusinessLine,
} from "@/hooks/use-business-lines";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/ui/search-input";
import type { BusinessLineWithRelations } from "@/lib/types/business-line";
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

export default function BusinessLinesPage() {
  const t = useTranslations("BusinessLines");

  const [selectedBusinessLine, setSelectedBusinessLine] =
    useState<BusinessLineWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessLineToDelete, setBusinessLineToDelete] =
    useState<BusinessLineWithRelations | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: businessLinesData,
    isLoading,
    error,
    isFetching,
  } = useBusinessLines({
    search: debouncedSearch || undefined,
  });
  const isSearching = isFetching && !isLoading;

  const deleteMutation = useDeleteBusinessLine();

  const handleCreate = () => {
    setSelectedBusinessLine(null);
    setDialogOpen(true);
  };

  const handleEdit = (businessLine: BusinessLineWithRelations) => {
    setSelectedBusinessLine(businessLine);
    setDialogOpen(true);
  };

  const handleDelete = (businessLine: BusinessLineWithRelations) => {
    setBusinessLineToDelete(businessLine);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!businessLineToDelete) return;

    try {
      await deleteMutation.mutateAsync(businessLineToDelete.id);
      toast.success(t("deleteSuccess"));
      setDeleteDialogOpen(false);
      setBusinessLineToDelete(null);
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
          {t("createBusinessLine")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t("businessLines")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
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
            <BusinessLineTable
              businessLines={businessLinesData?.businessLines || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          )}
        </CardContent>
      </Card>

      <BusinessLineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessLine={selectedBusinessLine}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", {
                name: businessLineToDelete?.name || "",
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
