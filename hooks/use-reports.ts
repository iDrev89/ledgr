import { useQuery } from "@tanstack/react-query";
import { getPurchaseReport, getBusinessSummary } from "@/apis/actions/reports";
import type {
  PurchaseReportFilters,
  BusinessSummaryFilters,
} from "@/lib/types/reports";

/**
 * Hook to fetch purchase report data
 */
export function usePurchaseReport(filters: PurchaseReportFilters) {
  return useQuery({
    queryKey: ["purchase-report", filters],
    queryFn: async () => {
      const response = await getPurchaseReport(filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!filters.startDate && !!filters.endDate,
  });
}

/**
 * Hook to fetch business summary data
 */
export function useBusinessSummary(filters: BusinessSummaryFilters) {
  return useQuery({
    queryKey: ["business-summary", filters],
    queryFn: async () => {
      const response = await getBusinessSummary(filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!filters.startDate && !!filters.endDate,
  });
}
