import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/apis/actions/customers";
import type { Customer } from "@/lib/types/customer";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/lib/validations/customer";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...customerKeys.lists(), filters] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
} as const;

export function useCustomers(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const result = await getCustomers(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const result = await getCustomer(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerInput) => {
      const result = await createCustomer(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCustomerInput) => {
      const result = await updateCustomer(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(
        customerKeys.detail(updatedCustomer.id),
        updatedCustomer,
      );
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCustomer(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: customerKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}
