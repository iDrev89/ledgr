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
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { useCreatePurchase } from "@/hooks/use-purchases";
import type { CreatePurchaseInput } from "@/lib/types/purchases";

export default function NewPurchasePage() {
  const t = useTranslations("Purchases");
  const router = useRouter();
  const createMutation = useCreatePurchase();

  const handleCreatePurchase = async (input: CreatePurchaseInput) => {
    try {
      await createMutation.mutateAsync(input);
      toast.success(t("createSuccess"));
      router.push("/purchases");
    } catch (error) {
      toast.error(t("createError"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/purchases");
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
            {t("newPurchase")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("purchaseDetails")}</CardTitle>
          <CardDescription>{t("fillPurchaseDetails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PurchaseForm
            onSubmit={handleCreatePurchase}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

