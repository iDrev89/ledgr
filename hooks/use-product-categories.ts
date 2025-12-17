import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductCategories,
  getProductCategory,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "@/apis/actions/product-categories";
import type {
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
} from "@/lib/validations/product-categories";

export const productCategoryKeys = {
  all: ["product-categories"] as const,
  lists: () => [...productCategoryKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...productCategoryKeys.lists(), filters] as const,
  detail: (id: string) => [...productCategoryKeys.all, "detail", id] as const,
} as const;

export function useProductCategories(params?: {
  search?: string;
  activeOnly?: boolean;
}) {
  return useQuery({
    queryKey: productCategoryKeys.list(params),
    queryFn: async () => {
      const result = await getProductCategories(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProductCategory(id: string) {
  return useQuery({
    queryKey: productCategoryKeys.detail(id),
    queryFn: async () => {
      const result = await getProductCategory(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductCategoryInput) => {
      const result = await createProductCategory(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.lists(),
      });
    },
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductCategoryInput) => {
      const result = await updateProductCategory(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(
        productCategoryKeys.detail(updatedCategory.id),
        updatedCategory,
      );
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.lists(),
      });
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductCategory(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: productCategoryKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.lists(),
      });
    },
  });
}
