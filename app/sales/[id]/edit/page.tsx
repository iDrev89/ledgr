"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SaleForm } from "@/components/sales/sale-form";
import { useSale, useUpdateSale } from "@/hooks/use-sales";
import type { UpdateSaleInput } from "@/lib/validations/sales";

export default function EditSalePage() {
  const t = useTranslations("Sales");
  const router = useRouter();
  const params = useParams();
  const saleId = params.id as string;

  const { data: sale, isLoading, error } = useSale(saleId);
  const updateMutation = useUpdateSale();

  const handleUpdateSale = async (input: UpdateSaleInput, isDraft?: boolean) => {
    try {
      await updateMutation.mutateAsync(input);
      toast.success(t("updateSuccess"));
      // Navigate back to sales list after successful update
      router.push("/sales");
    } catch (error) {
      toast.error(t("updateError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/sales");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("updateSale")}
            </h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("updateSale")}
            </h1>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : t("loadError")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("updateSale")} #{String(sale.saleNumber).padStart(4, "0")}
          </h1>
          <p className="text-muted-foreground">
            {sale.status === "DRAFT" ? t("statusDraft") : t("statusCompleted")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("saleDetails")}</CardTitle>
          <CardDescription>{t("fillSaleDetails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SaleForm
            sale={sale}
            onSubmit={handleUpdateSale}
            onCancel={handleCancel}
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
