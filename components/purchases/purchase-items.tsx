"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/types/product";
import type { PurchaseItem } from "@/lib/types/purchases";

interface PurchaseItemsProps {
  items: PurchaseItem[];
  onItemsChange: (items: PurchaseItem[]) => void;
  disabled?: boolean;
}

export function PurchaseItems({
  items,
  onItemsChange,
  disabled,
}: PurchaseItemsProps) {
  const t = useTranslations("Purchases");
  const [openProductSheet, setOpenProductSheet] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const { data: productsData } = useProducts({
    search: productSearch,
    type: "PRODUCT", // Solo productos, no servicios
    active: true,
    limit: 50,
  });
  const products = productsData?.products || [];

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: `temp-${Date.now()}`,
      productId: "",
      productName: "",
      quantity: 1,
      unitCost: 0,
      lineTotal: 0,
    };
    onItemsChange([...items, newItem]);
    setEditingItemId(newItem.id || null);
    setOpenProductSheet(true); // Abrir sheet automáticamente
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter((item) => item.id !== itemId));
  };

  const handleSelectProduct = (product: Product) => {
    if (!editingItemId) return;

    const updatedItems = items.map((item) => {
      if (item.id === editingItemId) {
        const unitCost = product.cost ? parseFloat(product.cost.toString()) : 0;
        const lineTotal = unitCost * item.quantity;
        return {
          ...item,
          productId: product.id,
          productName: product.name,
          unitCost,
          lineTotal,
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
    setOpenProductSheet(false);
    setProductSearch("");
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const lineTotal = item.unitCost * quantity;
        return { ...item, quantity, lineTotal };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const handleUpdateUnitCost = (itemId: string, unitCost: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const lineTotal = unitCost * item.quantity;
        return { ...item, unitCost, lineTotal };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const handleOpenProductSheet = (itemId: string) => {
    setEditingItemId(itemId);
    setOpenProductSheet(true);
  };

  const handleCloseSheet = (skipRemove = false) => {
    if (!skipRemove && editingItemId) {
      const item = items.find((i) => i.id === editingItemId);
      if (item && !item.productId) {
        onItemsChange(items.filter((i) => i.id !== editingItemId));
      }
    }
    setOpenProductSheet(false);
    setEditingItemId(null);
    setProductSearch("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t("items")} ({items.length})
        </h3>
        <Button
          type="button"
          size="sm"
          onClick={handleAddItem}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addProduct")}
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p className="font-medium">{t("noItems")}</p>
                <p className="text-sm mt-1">
                  Toca '{t("addItem")}' para comenzar
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, index) => (
            <Card key={item.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {item.productName || (
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => handleOpenProductSheet(item.id!)}
                          disabled={disabled}
                        >
                          {t("selectProduct")}
                        </Button>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Item #{index + 1}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id!)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.productId && <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${item.id}`}>
                      {t("quantity")}
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          item.id!,
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={disabled || !item.productId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`unitCost-${item.id}`}>
                      {t("unitCost")}
                    </Label>
                    <Input
                      id={`unitCost-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) =>
                        handleUpdateUnitCost(
                          item.id!,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={disabled || !item.productId}
                    />
                  </div>
                </div>}

                {item.productId && <Separator />}

                {item.productId && <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("lineTotal")}
                  </span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>}
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Product Selection Sheet */}
      <Sheet open={openProductSheet} onOpenChange={handleCloseSheet}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{t("selectProduct")}</SheetTitle>
            <SheetDescription>
              {t("selectProduct")}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              autoFocus
            />

            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="space-y-2">
                {products.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>{t("noProducts")}</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {product.description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {product.sku && (
                                <Badge variant="outline">
                                  SKU: {product.sku}
                                </Badge>
                              )}
                              {product.cost && (
                                <Badge variant="secondary">
                                  {formatCurrency(
                                    parseFloat(product.cost.toString())
                                  )}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

