"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BranchSelector } from "@/components/ui/branch-selector";
import { useProducts } from "@/hooks/use-products";
import { useTransferStock } from "@/hooks/use-inventory";
import {
  stockTransferSchema,
  type StockTransferInput,
} from "@/lib/validations/inventory";
import { useActiveBranch } from "@/hooks/use-active-branch";

interface StockTransferDialogProps {
  trigger?: React.ReactNode;
}

export const StockTransferDialog = ({ trigger }: StockTransferDialogProps) => {
  const t = useTranslations("Inventory");
  const [open, setOpen] = useState(false);
  const transferMutation = useTransferStock();
  const { data: productsData } = useProducts({ active: true });
  const { activeBranchId } = useActiveBranch();

  const form = useForm<StockTransferInput>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      productId: "",
      fromBranchId: activeBranchId || "",
      toBranchId: "",
      quantity: 1,
      note: "",
    },
  });

  const handleSubmit = async (data: StockTransferInput) => {
    try {
      await transferMutation.mutateAsync(data);
      toast.success(t("transferSuccess"));
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(t("transferError"), {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({
        productId: "",
        fromBranchId: activeBranchId || "",
        toBranchId: "",
        quantity: 1,
        note: "",
      });
    }
  };

  const isLoading = transferMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {t("transferStock")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("transferStock")}</DialogTitle>
            <DialogDescription>{t("transferDescription")}</DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 pt-4"
              >
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("product")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectProduct")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productsData?.products
                            .filter((p) => p.type === "PRODUCT")
                            .map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}{" "}
                                {product.sku ? `(${product.sku})` : ""}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromBranchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fromBranch")}</FormLabel>
                      <FormControl>
                        <BranchSelector
                          value={field.value || null}
                          onValueChange={(val) => field.onChange(val || "")}
                          disabled={isLoading}
                          allowNone={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toBranchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("toBranch")}</FormLabel>
                      <FormControl>
                        <BranchSelector
                          value={field.value || null}
                          onValueChange={(val) => field.onChange(val || "")}
                          disabled={isLoading}
                          allowNone={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("quantity")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                          placeholder={t("quantityPlaceholder")}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("note")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("notePlaceholder")}
                          disabled={isLoading}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    {t("transferStock")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
