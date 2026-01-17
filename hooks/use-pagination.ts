import { useState, useCallback } from "react";

interface UsePaginationProps {
  initialPage?: number;
  pageSize?: number;
  totalCount?: number;
}

export interface PaginationState {
  page: number; // 0-indexed
  pageSize: number;
  totalCount: number;
  pageCount: number;
  offset: number;
  hasNext: boolean;
  hasPrevious: boolean;
  setPage: (page: number) => void;
  onPageChange: (page: number) => void; // Alias for compatibility
  nextPage: () => void;
  previousPage: () => void;
}

export function usePagination({
  initialPage = 0,
  pageSize = 10,
  totalCount = 0,
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage);

  const pageCount = Math.ceil(totalCount / pageSize);
  const hasNext = page < pageCount - 1;
  const hasPrevious = page > 0;
  const offset = page * pageSize;

  const handlePageChange = useCallback((newPage: number) => {
    // Only clamp lower bound. Upper bound is checked by UI or parent component
    // to avoid circular dependency where totalCount depends on the query result
    const validPage = Math.max(0, newPage);
    setPage(validPage);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage((p) => p + 1);
    }
  }, [hasNext]);

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setPage((p) => p - 1);
    }
  }, [hasPrevious]);

  return {
    page,
    pageSize,
    totalCount,
    pageCount,
    offset,
    hasNext,
    hasPrevious,
    setPage: handlePageChange,
    onPageChange: handlePageChange,
    nextPage,
    previousPage,
  };
}
