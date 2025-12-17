"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, AlertCircle, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductTable } from "@/components/products/product-table";
import { ProductDialog } from "@/components/products/product-dialog";
import { CategoryTable } from "@/components/product-categories/category-table";
import { CategoryDialog } from "@/components/product-categories/category-dialog";
import { useProducts } from "@/hooks/use-products";
import { useProductCategories } from "@/hooks/use-product-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product } from "@/lib/types/product";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";

export default function ProductsPage() {
  const t = useTranslations("Products");
  const tCategories = useTranslations("ProductCategories");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<
    ProductCategoryWithRelations | undefined
  >(undefined);

  const { data, isLoading, error } = useProducts();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories();

  const handleCreate = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProduct(undefined);
  };

  const handleCreateCategory = () => {
    setCategoryToEdit(undefined);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: ProductCategoryWithRelations) => {
    setCategoryToEdit(category);
    setCategoryDialogOpen(true);
  };

  const handleCategoryDialogClose = (open: boolean) => {
    setCategoryDialogOpen(open);
    if (!open) {
      setCategoryToEdit(undefined);
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
          {t("createProduct")}
        </Button>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="mr-2 h-4 w-4" />
            {t("categories")}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("productList")}</CardTitle>
                  <CardDescription>
                    {t("productListDescription")}
                  </CardDescription>
                </div>
                {data && (
                  <div className="text-sm text-muted-foreground">
                    {t("totalProducts", { count: data.total })}
                  </div>
                )}
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
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ProductTable
                  products={data?.products || []}
                  onEdit={handleEdit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{tCategories("categoryList")}</CardTitle>
                  <CardDescription>
                    {tCategories("categoryListDescription")}
                  </CardDescription>
                </div>
                <Button onClick={handleCreateCategory} size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  {tCategories("createCategory")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {categoriesError instanceof Error
                      ? categoriesError.message
                      : tCategories("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {categoriesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <CategoryTable
                  categories={categories}
                  onEdit={handleEditCategory}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        product={selectedProduct}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={handleCategoryDialogClose}
        category={categoryToEdit}
      />
    </div>
  );
}
