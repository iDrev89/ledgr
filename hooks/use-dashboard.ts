import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getSalesChartData,
  getTopProducts,
  getLowStockAlerts,
} from "@/api/actions/dashboard";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const result = await getDashboardStats();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useSalesChartData = () => {
  return useQuery({
    queryKey: ["dashboard", "sales-chart"],
    queryFn: async () => {
      const result = await getSalesChartData();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn: async () => {
      const result = await getTopProducts();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: async () => {
      const result = await getLowStockAlerts();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 60000,
  });
};

