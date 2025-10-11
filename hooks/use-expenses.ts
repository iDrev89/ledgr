import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/apis/actions/expenses";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "@/lib/validations/expenses";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...expenseKeys.lists(), filters] as const,
  detail: (id: string) => [...expenseKeys.all, "detail", id] as const,
} as const;

export function useExpenses(params?: {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: async () => {
      const result = await getExpenses(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: async () => {
      const result = await getExpense(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      const result = await createExpense(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.lists(),
      });
      // Invalidate dashboard since expenses affect it
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExpenseInput) => {
      const result = await updateExpense(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData(expenseKeys.detail(updatedExpense.id), updatedExpense);
      queryClient.invalidateQueries({
        queryKey: expenseKeys.lists(),
      });
      // Invalidate dashboard
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteExpense(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: expenseKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: expenseKeys.lists(),
      });
      // Invalidate dashboard
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

