import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/apis/actions/suppliers";

// Query key
export const SUPPLIERS_QUERY_KEY = ["suppliers"];

/**
 * Hook to fetch all suppliers
 */
export function useSuppliers(params?: {
  search?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...SUPPLIERS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await getSuppliers(params);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

/**
 * Hook to fetch supplier by ID
 */
export function useSupplier(id: string) {
  return useQuery({
    queryKey: [...SUPPLIERS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getSupplier(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      taxId?: string;
      email?: string;
      phone?: string;
      address?: string;
    }) => {
      const response = await createSupplier(input);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}

/**
 * Hook to update supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      taxId?: string;
      email?: string;
      phone?: string;
      address?: string;
    }) => {
      const response = await updateSupplier(input);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteSupplier(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}

