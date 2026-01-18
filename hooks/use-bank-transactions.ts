import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBankTransactions,
  getBankTransaction,
  createBankTransaction,
  createBankTransfer,
  updateBankTransaction,
  deleteBankTransaction,
  getBanksWithBalance,
} from "@/apis/actions/bank-transactions";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateTransferInput,
} from "@/lib/validations/bank-transactions";

export const bankTransactionKeys = {
  all: ["bank-transactions"] as const,
  lists: () => [...bankTransactionKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...bankTransactionKeys.lists(), filters] as const,
  detail: (id: string) => [...bankTransactionKeys.all, "detail", id] as const,
  banksWithBalance: (filters?: Record<string, any>) =>
    ["banks", "with-balance", filters] as const,
} as const;

export function useBankTransactions(params?: {
  bankId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: bankTransactionKeys.list(params),
    queryFn: async () => {
      const result = await getBankTransactions(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useBankTransaction(id: string) {
  return useQuery({
    queryKey: bankTransactionKeys.detail(id),
    queryFn: async () => {
      const result = await getBankTransaction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateBankTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const result = await createBankTransaction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.banksWithBalance(),
      });
    },
  });
}

export function useCreateBankTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransferInput) => {
      const result = await createBankTransfer(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.banksWithBalance(),
      });
    },
  });
}

export function useUpdateBankTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTransactionInput) => {
      const result = await updateBankTransaction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedTransaction) => {
      queryClient.setQueryData(
        bankTransactionKeys.detail(updatedTransaction.id),
        updatedTransaction,
      );
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.banksWithBalance(),
      });
    },
  });
}

export function useDeleteBankTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBankTransaction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: bankTransactionKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: bankTransactionKeys.banksWithBalance(),
      });
    },
  });
}

export function useBanksWithBalance(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: bankTransactionKeys.banksWithBalance(params),
    queryFn: async () => {
      const result = await getBanksWithBalance(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
