"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { useCustomers } from "@/hooks/use-customers";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import type { Customer } from "@/lib/types/customer";

export default function CustomersPage() {
  const t = useTranslations("Customers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();

  // Server-side search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Pagination state
  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  // Reset pagination when search changes
  useEffect(() => {
    pagination.setPage(0);
  }, [searchInput]);

  // Fetch customers with server-side search and pagination
  const { data, isLoading, error, isFetching } = useCustomers({
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });

  // Show loading indicator when fetching but not on initial load
  const isSearching = isFetching && !isLoading;

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCustomer(undefined);
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
          {t("createCustomer")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t("customerList")}</CardTitle>
              <CardDescription>{t("customerListDescription")}</CardDescription>
            </div>
            <div className="w-full md:w-auto md:min-w-[300px]">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder={t("searchPlaceholder")}
                isLoading={isSearching}
              />
            </div>
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
            </div>
          ) : (
            <>
              <CustomerTable
                customers={data?.customers || []}
                onEdit={handleEdit}
                enablePagination={false}
              />
              <PaginationControl
                currentPage={pagination.page}
                totalCount={data?.total || 0}
                pageSize={PAGE_SIZE}
                onPageChange={pagination.onPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        customer={selectedCustomer}
      />
    </div>
  );
}
