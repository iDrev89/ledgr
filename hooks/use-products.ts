import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/apis/actions/products";
import type { Product } from "@/lib/types/product";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/validations/product";
import { inventoryKeys } from "./use-inventory";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...productKeys.lists(), filters] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
} as const;

export function useProducts(params?: {
  search?: string;
  type?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const result = await getProducts(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const result = await getProduct(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const result = await createProduct(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
      // Invalidate inventory queries to show the new product in inventory
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductInput) => {
      const result = await updateProduct(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct,
      );
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
      // Invalidate inventory queries to update product info in inventory
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProduct(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: productKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}
