import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockMovements,
  getStockMovement,
  createStockMovement,
  getProductStock,
  getInventorySummary,
} from "@/apis/actions/inventory";
import type { StockMoveType } from "@/prisma/prisma-client";
import type { CreateStockMovementInput } from "@/lib/validations/inventory";

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...inventoryKeys.lists(), filters] as const,
  detail: (id: string) => [...inventoryKeys.all, "detail", id] as const,
  productStock: (productId: string) =>
    [...inventoryKeys.all, "product-stock", productId] as const,
  summary: () => [...inventoryKeys.all, "summary"] as const,
} as const;

export function useStockMovements(params?: {
  productId?: string;
  moveType?: StockMoveType;
  limit?: number;
  offset?: number;
}) {
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
}

export function useStockMovement(id: string) {
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
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStockMovementInput) => {
      const result = await createStockMovement(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate all inventory-related queries
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
      // Invalidate the specific product stock query to update the history
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.productStock(data.productId),
      });
      // Invalidate all product stock queries in case the dialog was closed before seeing the update
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.all,
      });
    },
  });
}

export function useProductStock(productId: string) {
  return useQuery({
    queryKey: inventoryKeys.productStock(productId),
    queryFn: async () => {
      const result = await getProductStock(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!productId,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: async () => {
      const result = await getInventorySummary();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

