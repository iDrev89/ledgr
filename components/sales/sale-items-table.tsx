"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/types/product";

export interface SaleItemRow {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  lineTotal: number;
}

interface SaleItemsTableProps {
  items: SaleItemRow[];
  onItemsChange: (items: SaleItemRow[]) => void;
  disabled?: boolean;
}

export function SaleItemsTable({
  items,
  onItemsChange,
  disabled,
}: SaleItemsTableProps) {
  const t = useTranslations("Sales");
  const [productSearch, setProductSearch] = useState("");
  const [openProductSelector, setOpenProductSelector] = useState<string | null>(
    null
  );

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
      quantity: 1,
      unitPrice: "0",
      discount: "0",
      lineTotal: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter((item) => item.id !== itemId));
  };

  const handleSelectProduct = (itemId: string, product: Product) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const unitPrice = product.price.toString();
        const lineTotal = parseFloat(unitPrice) * item.quantity;
        return {
          ...item,
          productId: product.id,
          productName: product.name,
          unitPrice,
          lineTotal,
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
    setOpenProductSelector(null);
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const lineTotal =
          parseFloat(item.unitPrice) * quantity - parseFloat(item.discount);
        return { ...item, quantity, lineTotal };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const handleUnitPriceChange = (itemId: string, value: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const lineTotal =
          parseFloat(value || "0") * item.quantity - parseFloat(item.discount);
        return { ...item, unitPrice: value, lineTotal };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const handleDiscountChange = (itemId: string, value: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        const lineTotal =
          parseFloat(item.unitPrice) * item.quantity - parseFloat(value || "0");
        return { ...item, discount: value, lineTotal };
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("items")}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addItem")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">{t("product")}</TableHead>
              <TableHead className="w-[15%] text-right">{t("quantity")}</TableHead>
              <TableHead className="w-[15%] text-right">{t("unitPrice")}</TableHead>
              <TableHead className="w-[15%] text-right">{t("discount")}</TableHead>
              <TableHead className="w-[15%] text-right">{t("lineTotal")}</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("noItems")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Popover
                      open={openProductSelector === item.id}
                      onOpenChange={(open) =>
                        setOpenProductSelector(open ? item.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled={disabled}
                        >
                          {item.productName || (
                            <span className="text-muted-foreground">
                              {t("selectProduct")}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder={t("searchProduct")}
                            value={productSearch}
                            onValueChange={setProductSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="flex flex-col items-center justify-center gap-2 py-6">
                                <Search className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {t("noProductsFound")}
                                </p>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {products.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.id}
                                  onSelect={() =>
                                    handleSelectProduct(item.id, product)
                                  }
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {product.name}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {product.sku && (
                                        <span>SKU: {product.sku}</span>
                                      )}
                                      <span>
                                        {formatCurrency(parseFloat(product.price.toString()))}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      className="text-right"
                      disabled={disabled || !item.productId}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUnitPriceChange(item.id, e.target.value)
                      }
                      className="text-right"
                      disabled={disabled || !item.productId}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.discount}
                      onChange={(e) =>
                        handleDiscountChange(item.id, e.target.value)
                      }
                      className="text-right"
                      disabled={disabled || !item.productId}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.lineTotal)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {items.length > 0 && (
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-medium">
                {formatCurrency(
                  items.reduce(
                    (sum, item) =>
                      sum + parseFloat(item.unitPrice || "0") * item.quantity,
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("discountTotal")}</span>
              <span className="font-medium text-destructive">
                -
                {formatCurrency(
                  items.reduce(
                    (sum, item) => sum + parseFloat(item.discount || "0"),
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">{t("total")}</span>
              <span className="text-lg font-bold">
                {formatCurrency(
                  items.reduce((sum, item) => sum + item.lineTotal, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

