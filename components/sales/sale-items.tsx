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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/types/product";

export interface SaleItemRow {
  id: string;
  productId: string;
  productName: string;
  productType?: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  lineTotal: number;
  performedById?: string;
  performedByName?: string;
}

interface SaleItemsProps {
  items: SaleItemRow[];
  onItemsChange: (items: SaleItemRow[]) => void;
  disabled?: boolean;
}

export function SaleItems({
  items,
  onItemsChange,
  disabled,
}: SaleItemsProps) {
  const t = useTranslations("Sales");
  const [openProductSheet, setOpenProductSheet] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const { data: productsData } = useProducts({
    search: productSearch,
    active: true,
    limit: 50,
  });
  const products = productsData?.products || [];

  const handleAddItem = () => {
    const newItem: SaleItemRow = {
      id: `temp-${Date.now()}`,
      productId: "",
      productName: "",
      productType: undefined,
      quantity: 1,
      unitPrice: "0",
      discount: "0",
      lineTotal: 0,
      performedById: undefined,
      performedByName: undefined,
    };
    onItemsChange([...items, newItem]);
    setEditingItemId(newItem.id);
    handleCloseSheet(true);
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter((item) => item.id !== itemId));
  };

  const handleSelectProduct = (product: Product) => {
    if (!editingItemId) return;

    const updatedItems = items.map((item) => {
      if (item.id === editingItemId) {
        const unitPrice = product.price.toString();
        const lineTotal = parseFloat(unitPrice) * item.quantity;
        return {
          ...item,
          productId: product.id,
          productName: product.name,
          productType: product.type,
          unitPrice,
          lineTotal,
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
    setOpenProductSheet(false);
    setEditingItemId(null);
    setProductSearch("");
  };

  const handleCloseSheet = (open: boolean) => {
    if (!open && editingItemId) {
      // Si se cierra el sheet sin haber seleccionado un producto, eliminar el item vacío
      const editingItem = items.find((item) => item.id === editingItemId);
      if (editingItem && !editingItem.productId) {
        handleRemoveItem(editingItemId);
      }
      setEditingItemId(null);
      setProductSearch("");
    }
    setOpenProductSheet(open);
  };

  const handleUpdateItem = (itemId: string, field: keyof SaleItemRow, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        
        // Recalculate lineTotal
        const unitPrice = parseFloat(updated.unitPrice || "0");
        const quantity = updated.quantity;
        const discount = parseFloat(updated.discount || "0");
        updated.lineTotal = unitPrice * quantity - discount;
        
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice || "0") * item.quantity,
    0
  );
  const totalDiscount = items.reduce(
    (sum, item) => sum + parseFloat(item.discount || "0"),
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold">
            {t("items")} ({items.length})
          </h3>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddItem}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addItem")}
        </Button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">{t("noItems")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("tapAddItemToStart")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, index) => (
            <Card key={item.id} className="relative border-2 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {item.productName ? (
                      <>
                        <CardTitle className="text-base truncate">
                          {item.productName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Item #{index + 1}
                        </p>
                      </>
                    ) : (
                      <Sheet
                        open={openProductSheet && editingItemId === item.id}
                        onOpenChange={(open) => {
                          if (open) setEditingItemId(item.id);
                          handleCloseSheet(open);
                        }}
                      >
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3"
                            disabled={disabled}
                          >
                            <span className="text-muted-foreground">
                              {t("selectProduct")}
                            </span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh]">
                          <SheetHeader>
                            <SheetTitle>{t("selectProduct")}</SheetTitle>
                            <SheetDescription>
                              {t("selectProductDescription")}
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-4 space-y-4">
                            <Input
                              placeholder={t("searchProduct")}
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="w-full"
                            />
                            <ScrollArea className="h-[calc(85vh-180px)]">
                              <div className="space-y-2 pr-4">
                                {products.length === 0 ? (
                                  <div className="text-center py-12">
                                    <p className="text-sm text-muted-foreground">
                                      {t("noProductsFound")}
                                    </p>
                                  </div>
                                ) : (
                                  products.map((product) => (
                                    <Card
                                      key={product.id}
                                      className="cursor-pointer hover:bg-accent transition-colors"
                                      onClick={() => handleSelectProduct(product)}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                              {product.name}
                                            </p>
                                            {product.sku && (
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                SKU: {product.sku}
                                              </p>
                                            )}
                                            <Badge variant="secondary" className="mt-2">
                                              {product.type === "PRODUCT"
                                                ? t("productTypeProduct")
                                                : t("productTypeService")}
                                            </Badge>
                                          </div>
                                          <p className="text-base font-bold shrink-0">
                                            {formatCurrency(parseFloat(product.price.toString()))}
                                          </p>
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
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={disabled}
                    className="shrink-0 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>

              {item.productId && (
                <CardContent className="space-y-3 pt-0">
                  <Separator />
                  
                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`quantity-${item.id}`} className="text-xs">
                      {t("quantity")}
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={disabled}
                      className="text-base h-11"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`price-${item.id}`} className="text-xs">
                      {t("unitPrice")}
                    </Label>
                    <Input
                      id={`price-${item.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "unitPrice", e.target.value)
                      }
                      disabled={disabled}
                      className="text-base h-11"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`discount-${item.id}`} className="text-xs">
                      {t("discount")}
                    </Label>
                    <Input
                      id={`discount-${item.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.discount}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "discount", e.target.value)
                      }
                      disabled={disabled}
                      className="text-base h-11"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("lineTotal")}
                      </span>
                      <span className="text-lg font-bold">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <Card className="bg-primary/5 border-primary/20 border-2 shadow-md">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">{t("subtotal")}</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">{t("discountTotal")}</span>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(totalDiscount)}
                </span>
              </div>
            )}
            <Separator className="bg-primary/20" />
            <div className="flex justify-between pt-1">
              <span className="text-base font-bold">{t("total")}</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Selection Sheet */}
      <Sheet
        open={openProductSheet && editingItemId !== null && items.find(i => i.id === editingItemId)?.productId === ""}
        onOpenChange={handleCloseSheet}
      >
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>{t("selectProduct")}</SheetTitle>
            <SheetDescription>
              {t("selectProductDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder={t("searchProduct")}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full"
            />
            <ScrollArea className="h-[calc(85vh-180px)]">
              <div className="space-y-2 pr-4">
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">
                      {t("noProductsFound")}
                    </p>
                  </div>
                ) : (
                  products.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                SKU: {product.sku}
                              </p>
                            )}
                            <Badge variant="secondary" className="mt-2">
                              {product.type === "PRODUCT"
                                ? t("productTypeProduct")
                                : t("productTypeService")}
                            </Badge>
                          </div>
                          <p className="text-base font-bold shrink-0">
                            {formatCurrency(parseFloat(product.price.toString()))}
                          </p>
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

