"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
import { SaleForm } from "@/components/sales/sale-form";
import { useCreateSale } from "@/hooks/use-sales";
import type { CreateSaleInput } from "@/lib/validations/sales";

export default function NewSalePage() {
  const t = useTranslations("Sales");
  const router = useRouter();
  const createMutation = useCreateSale();

  const handleCreateSale = async (input: CreateSaleInput, isDraft?: boolean) => {
    try {
      await createMutation.mutateAsync({ input, isDraft });
      toast.success(t("createSuccess"));
      // Navigate back to sales list after successful creation
      router.push("/sales");
    } catch (error) {
      toast.error(t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/sales");
  };

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
            {t("newSale")}
          </h1>
          <p className="text-muted-foreground">{t("newSaleDescription")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("saleDetails")}</CardTitle>
          <CardDescription>{t("fillSaleDetails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SaleForm
            onSubmit={handleCreateSale}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
