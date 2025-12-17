import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
} from "@/apis/actions/purchases";
import type { CreatePurchaseInput } from "@/lib/types/purchases";

// Query key
export const PURCHASES_QUERY_KEY = ["purchases"];

/**
 * Hook to fetch all purchases
 */
export function usePurchases() {
  return useQuery({
    queryKey: PURCHASES_QUERY_KEY,
    queryFn: async () => {
      const response = await getPurchases();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

/**
 * Hook to fetch purchase by ID
 */
export function usePurchase(id: string) {
  return useQuery({
    queryKey: [...PURCHASES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getPurchaseById(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create purchase
 */
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePurchaseInput) => {
      const response = await createPurchase(input);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate purchases list
      queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
      // Also invalidate inventory since it's affected
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

/**
 * Hook to delete purchase
 */
export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePurchase(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate purchases list
      queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
      // Also invalidate inventory since it's affected
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

