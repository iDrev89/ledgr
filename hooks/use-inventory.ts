import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockMovements,
  getStockMovement,
  createStockMovement,
  getProductStock,
  getInventorySummary,
  transferStock,
} from "@/apis/actions/inventory";
import type { StockMoveType } from "@/prisma/prisma-client";
import type { CreateStockMovementInput, StockTransferInput } from "@/lib/validations/inventory";

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...inventoryKeys.lists(), filters] as const,
  detail: (id: string) => [...inventoryKeys.all, "detail", id] as const,
  productStock: (productId: string, branchId?: string) =>
    [...inventoryKeys.all, "product-stock", productId, branchId] as const,
  summary: (filters?: Record<string, any>) =>
    [...inventoryKeys.all, "summary", filters] as const,
} as const;

export const useStockMovements = (params?: {
  productId?: string;
  branchId?: string;
  moveType?: StockMoveType;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: async () => {
      const result = await getStockMovements(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useStockMovement = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: async () => {
      const result = await getStockMovement(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStockMovementInput) => {
      const result = await createStockMovement(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useProductStock = (productId: string, branchId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.productStock(productId, branchId),
    queryFn: async () => {
      const result = await getProductStock(productId, branchId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!productId,
  });
};

export const useInventorySummary = (params?: {
  search?: string;
  branchId?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: inventoryKeys.summary(params),
    queryFn: async () => {
      const result = await getInventorySummary(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useTransferStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StockTransferInput) => {
      const result = await transferStock(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};
