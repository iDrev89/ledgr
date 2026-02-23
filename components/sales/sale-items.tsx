"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Minus, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useProducts } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function SaleItems({ items, onItemsChange, disabled }: SaleItemsProps) {
  const t = useTranslations("Sales");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const { data: productsData } = useProducts({
    search: productSearch,
    active: true,
    limit: 50,
  });
  const products = productsData?.products || [];

  const editingItem = items.find((i) => i.id === editingItemId) ?? null;

  const recalcLineTotal = (item: SaleItemRow): SaleItemRow => {
    const unitPrice = parseFloat(item.unitPrice || "0");
    const discount = parseFloat(item.discount || "0");
    return { ...item, lineTotal: unitPrice * item.quantity - discount };
  };

  const handleAddItem = () => {
    setProductPickerOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    const newId = `temp-${Date.now()}`;
    const unitPrice = product.price.toString();
    const newItem: SaleItemRow = {
      id: newId,
      productId: product.id,
      productName: product.name,
      productType: product.type,
      quantity: 1,
      unitPrice,
      discount: "0",
      lineTotal: parseFloat(unitPrice),
    };
    onItemsChange([...items, newItem]);
    setProductSearch("");
    setProductPickerOpen(false);
    // Open edit sheet after picker sheet animates out
    setTimeout(() => setEditingItemId(newId), 350);
  };

  const handleUpdateEditingItem = (field: keyof SaleItemRow, value: any) => {
    if (!editingItemId) return;
    onItemsChange(
      items.map((item) => {
        if (item.id !== editingItemId) return item;
        return recalcLineTotal({ ...item, [field]: value });
      }),
    );
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter((i) => i.id !== id));
    if (editingItemId === id) setEditingItemId(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice || "0") * item.quantity,
    0,
  );
  const totalDiscount = items.reduce(
    (sum, item) => sum + parseFloat(item.discount || "0"),
    0,
  );
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("items")}
          {items.length > 0 && ` (${items.length})`}
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddItem}
          disabled={disabled}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {t("addItem")}
        </Button>
      </div>

      {/* Empty state — tappable */}
      {items.length === 0 ? (
        <button
          type="button"
          onClick={handleAddItem}
          disabled={disabled}
          className="w-full rounded-md border border-dashed py-10 flex flex-col items-center gap-2 text-muted-foreground hover:bg-accent/50 active:bg-accent transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">{t("tapAddItemToStart")}</span>
        </button>
      ) : (
        /* Items as ledger rows */
        <div className="rounded-md border overflow-hidden">
          {items.map((item) => {
            const discount = parseFloat(item.discount || "0");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setEditingItemId(item.id)}
                disabled={disabled}
                className="flex items-center gap-3 w-full px-3 py-3 border-b border-border/40 last:border-0 hover:bg-accent/50 active:bg-accent transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">
                    {item.productName}
                  </p>
                  {discount > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      -{formatCurrency(discount)} dto.
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  ×{item.quantity}
                </span>
                <span className="font-mono text-sm font-medium tabular-nums shrink-0 w-24 text-right">
                  {formatCurrency(item.lineTotal)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            );
          })}

          {/* Summary rows — ledger-line style */}
          {totalDiscount > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-t border-border/40">
                <span className="text-xs text-muted-foreground">
                  {t("subtotal")}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-t border-border/40">
                <span className="text-xs text-muted-foreground">
                  {t("discountTotal")}
                </span>
                <span className="font-mono text-xs tabular-nums text-destructive">
                  -{formatCurrency(totalDiscount)}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between px-3 py-3 bg-muted/40 border-t">
            <span className="text-sm font-semibold">{t("total")}</span>
            <span className="font-mono text-base font-bold tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}

      {/* Product picker drawer — vaul, swipe-to-dismiss */}
      <Drawer
        open={productPickerOpen}
        onOpenChange={(open) => {
          setProductPickerOpen(open);
          if (!open) setProductSearch("");
        }}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className="h-[85vh] flex flex-col"
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
        >
          <div className="shrink-0 px-4 pb-3">
            <DrawerHeader className="p-0 pt-1 text-left">
              <DrawerTitle>{t("selectProduct")}</DrawerTitle>
            </DrawerHeader>
          </div>
          <div className="px-4 flex flex-col gap-3 flex-1 min-h-0 pb-4">
            <Input
              placeholder={t("searchProduct")}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="h-11 shrink-0"
            />
            <div className="flex-1 overflow-y-auto">
              <div className="rounded-md border overflow-hidden">
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    {t("noProductsFound")}
                  </p>
                ) : (
                  products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center justify-between w-full px-4 py-3.5 border-b border-border/40 last:border-0 hover:bg-accent/50 active:bg-accent transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            SKU: {product.sku}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums shrink-0 ml-4">
                        {formatCurrency(parseFloat(product.price.toString()))}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Item edit drawer — vaul, swipe-to-dismiss */}
      <Drawer
        open={editingItemId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingItemId(null);
        }}
        shouldScaleBackground={false}
      >
        <DrawerContent className="flex flex-col">
          {editingItem && (
            <div className="flex flex-col gap-5 px-4 pb-8">
              <div className="shrink-0 pb-1">
                <DrawerHeader className="p-0 pt-1 text-left">
                  <DrawerTitle className="text-base truncate">
                    {editingItem.productName}
                  </DrawerTitle>
                </DrawerHeader>
              </div>

              {/* Quantity stepper */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("quantity")}
                </Label>
                <div className="flex items-stretch h-12">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-full w-14 rounded-r-none shrink-0"
                    onClick={() =>
                      handleUpdateEditingItem(
                        "quantity",
                        Math.max(1, editingItem.quantity - 1),
                      )
                    }
                    disabled={disabled || editingItem.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="h-full flex-1 flex items-center justify-center border-y border-input font-mono text-lg font-semibold tabular-nums">
                    {editingItem.quantity}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-full w-14 rounded-l-none shrink-0"
                    onClick={() =>
                      handleUpdateEditingItem(
                        "quantity",
                        editingItem.quantity + 1,
                      )
                    }
                    disabled={disabled}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Unit price */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-unit-price"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {t("unitPrice")}
                </Label>
                <Input
                  id="edit-unit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingItem.unitPrice}
                  onChange={(e) =>
                    handleUpdateEditingItem("unitPrice", e.target.value)
                  }
                  disabled={disabled}
                  className="h-12 text-base font-mono tabular-nums"
                />
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-discount"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {t("discount")}
                </Label>
                <Input
                  id="edit-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingItem.discount}
                  onChange={(e) =>
                    handleUpdateEditingItem("discount", e.target.value)
                  }
                  disabled={disabled}
                  className="h-12 text-base font-mono tabular-nums"
                />
              </div>

              {/* Line total */}
              <div className="rounded-md border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("lineTotal")}
                  </span>
                  <span className="font-mono text-lg font-bold tabular-nums">
                    {formatCurrency(editingItem.lineTotal)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12 shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemoveItem(editingItem.id)}
                  disabled={disabled}
                  aria-label="Eliminar item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  className="h-12 flex-1"
                  onClick={() => setEditingItemId(null)}
                >
                  {t("done")}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
