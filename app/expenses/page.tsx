"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, AlertCircle, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseDetailDialog } from "@/components/expenses/expense-detail-dialog";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { CategoryTable } from "@/components/expense-categories/category-table";
import { CategoryDialog } from "@/components/expense-categories/category-dialog";
import { useExpenses } from "@/hooks/use-expenses";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/ui/search-input";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import type { ExpenseWithDetails } from "@/lib/types/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/types/expense-categories";

export default function ExpensesPage() {
  const t = useTranslations("Expenses");
  const tCategories = useTranslations("ExpenseCategories");
  const locale = useLocale();

  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseWithDetails | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<
    ExpenseWithDetails | undefined
  >(undefined);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<
    ExpenseCategoryWithRelations | undefined
  >(undefined);

  // Server-side search states
  const [expenseSearch, setExpenseSearch] = useState("");
  const debouncedExpenseSearch = useDebounce(expenseSearch, 300);
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch, 300);

  // Pagination for expenses
  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  // Reset pagination when search changes
  useEffect(() => {
    pagination.setPage(0);
  }, [debouncedExpenseSearch]);

  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
    isFetching: expensesFetching,
  } = useExpenses({
    search: debouncedExpenseSearch || undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });
  const isExpenseSearching = expensesFetching && !expensesLoading;

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    isFetching: categoriesFetching,
  } = useExpenseCategories(
    debouncedCategorySearch ? { search: debouncedCategorySearch } : undefined,
  );
  const isCategorySearching = categoriesFetching && !categoriesLoading;

  const handleCreateExpense = () => {
    setExpenseToEdit(undefined);
    setExpenseDialogOpen(true);
  };

  const handleViewExpense = (expense: ExpenseWithDetails) => {
    setSelectedExpense(expense);
    setDetailDialogOpen(true);
  };

  const handleEditExpense = (expense: ExpenseWithDetails) => {
    setExpenseToEdit(expense);
    setExpenseDialogOpen(true);
  };

  const handleExpenseDialogClose = (open: boolean) => {
    setExpenseDialogOpen(open);
    if (!open) {
      setExpenseToEdit(undefined);
    }
  };

  const handleCreateCategory = () => {
    setCategoryToEdit(undefined);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: ExpenseCategoryWithRelations) => {
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
        <Button onClick={handleCreateExpense} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("createExpense")}
        </Button>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList>
          <TabsTrigger value="expenses">{t("expenses")}</TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="mr-2 h-4 w-4" />
            {t("categories")}
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{t("expenseHistory")}</CardTitle>
                  <CardDescription>
                    {t("expenseHistoryDescription")}
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto md:min-w-[300px]">
                  <SearchInput
                    value={expenseSearch}
                    onChange={setExpenseSearch}
                    placeholder={t("searchPlaceholder")}
                    isLoading={isExpenseSearching}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {expensesError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {expensesError instanceof Error
                      ? expensesError.message
                      : t("loadError")}
                  </AlertDescription>
                </Alert>
              )}

              {expensesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <ExpenseTable
                    expenses={expensesData?.expenses || []}
                    onView={handleViewExpense}
                    onEdit={handleEditExpense}
                    locale={locale}
                    enablePagination={false}
                  />
                  <PaginationControl
                    currentPage={pagination.page}
                    totalCount={expensesData?.total || 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={pagination.onPageChange}
                  />
                </>
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
                <Button
                  onClick={handleCreateCategory}
                  size="sm"
                  className="w-full sm:w-auto"
                >
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
                  searchValue={categorySearch}
                  onSearchChange={setCategorySearch}
                  isSearching={isCategorySearching}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        expense={selectedExpense}
        locale={locale}
      />

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={handleExpenseDialogClose}
        expense={expenseToEdit}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={handleCategoryDialogClose}
        category={categoryToEdit}
      />
    </div>
  );
}
