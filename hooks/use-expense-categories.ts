import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenseCategories,
  getExpenseCategory,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/apis/actions/expense-categories";
import type {
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
} from "@/lib/validations/expense-categories";

export const expenseCategoryKeys = {
  all: ["expense-categories"] as const,
  lists: () => [...expenseCategoryKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...expenseCategoryKeys.lists(), filters] as const,
  detail: (id: string) => [...expenseCategoryKeys.all, "detail", id] as const,
} as const;

export function useExpenseCategories(params?: {
  search?: string;
  activeOnly?: boolean;
}) {
  return useQuery({
    queryKey: expenseCategoryKeys.list(params),
    queryFn: async () => {
      const result = await getExpenseCategories(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useExpenseCategory(id: string) {
  return useQuery({
    queryKey: expenseCategoryKeys.detail(id),
    queryFn: async () => {
      const result = await getExpenseCategory(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseCategoryInput) => {
      const result = await createExpenseCategory(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseCategoryKeys.lists(),
      });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExpenseCategoryInput) => {
      const result = await updateExpenseCategory(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(
        expenseCategoryKeys.detail(updatedCategory.id),
        updatedCategory,
      );
      queryClient.invalidateQueries({
        queryKey: expenseCategoryKeys.lists(),
      });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteExpenseCategory(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: expenseCategoryKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: expenseCategoryKeys.lists(),
      });
    },
  });
}
