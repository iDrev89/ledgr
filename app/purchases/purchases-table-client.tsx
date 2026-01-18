"use client";

import { PurchaseTable } from "@/components/purchases/purchase-table";
import { usePurchases } from "@/hooks/use-purchases";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControl } from "@/components/ui/pagination-control";
import { SearchInput } from "@/components/ui/search-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function PurchasesTableClient() {
  const t = useTranslations("Purchases");

  // Search state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination state
  const PAGE_SIZE = 10;
  const pagination = usePagination({
    pageSize: PAGE_SIZE,
    initialPage: 0,
  });

  // Reset pagination when search changes
  useEffect(() => {
    pagination.setPage(0);
  }, [debouncedSearch]);

  const { data, isLoading, error, isFetching } = usePurchases({
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });

  const isSearching = isFetching && !isLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>{t("purchaseList")}</CardTitle>
            <CardDescription>{t("purchaseListDescription")}</CardDescription>
          </div>
          <div className="w-full md:w-auto md:min-w-[300px]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("searchPlaceholder")}
              isLoading={isSearching}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">{t("loadError")}</p>
          </div>
        ) : (
          <>
            <PurchaseTable
              purchases={data?.purchases || []}
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
  );
}
