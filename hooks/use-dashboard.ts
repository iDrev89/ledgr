import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getSalesChartData,
  getTopProducts,
  getLowStockAlerts,
} from "@/apis/actions/dashboard";

interface DashboardFilterParams {
  branchId?: string;
  businessLineId?: string;
}

export const useDashboardStats = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: ["dashboard", "stats", params?.branchId, params?.businessLineId],
    queryFn: async () => {
      const result = await getDashboardStats(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

export const useSalesChartData = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: ["dashboard", "sales-chart", params?.branchId, params?.businessLineId],
    queryFn: async () => {
      const result = await getSalesChartData(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

export const useTopProducts = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: ["dashboard", "top-products", params?.branchId, params?.businessLineId],
    queryFn: async () => {
      const result = await getTopProducts(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

export const useLowStockAlerts = (branchId?: string) => {
  return useQuery({
    queryKey: ["dashboard", "low-stock", branchId],
    queryFn: async () => {
      const result = await getLowStockAlerts({ branchId });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

export const useTodaysBirthdays = () => {
  return useQuery({
    queryKey: ["dashboard", "todays-birthdays"],
    queryFn: async () => {
      const { getTodaysBirthdays } = await import("@/apis/actions/dashboard");
      const result = await getTodaysBirthdays();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000 * 60,
  });
};
