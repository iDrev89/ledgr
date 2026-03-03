import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccountTransactions,
  getAccountTransaction,
  createAccountTransaction,
  createAccountTransfer,
  updateAccountTransaction,
  deleteAccountTransaction,
  getAccountsWithBalance,
} from "@/apis/actions/account-transactions";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateTransferInput,
} from "@/lib/validations/account-transactions";

export const accountTransactionKeys = {
  all: ["account-transactions"] as const,
  lists: () => [...accountTransactionKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...accountTransactionKeys.lists(), filters] as const,
  detail: (id: string) =>
    [...accountTransactionKeys.all, "detail", id] as const,
  accountsWithBalance: (filters?: Record<string, any>) =>
    ["accounts", "with-balance", filters] as const,
} as const;

export const useAccountTransactions = (params?: {
  accountId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: accountTransactionKeys.list(params),
    queryFn: async () => {
      const result = await getAccountTransactions(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useAccountTransaction = (id: string) => {
  return useQuery({
    queryKey: accountTransactionKeys.detail(id),
    queryFn: async () => {
      const result = await getAccountTransaction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateAccountTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const result = await createAccountTransaction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.accountsWithBalance(),
      });
    },
  });
};

export const useCreateAccountTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransferInput) => {
      const result = await createAccountTransfer(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.accountsWithBalance(),
      });
    },
  });
};

export const useUpdateAccountTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTransactionInput) => {
      const result = await updateAccountTransaction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedTransaction) => {
      queryClient.setQueryData(
        accountTransactionKeys.detail(updatedTransaction.id),
        updatedTransaction,
      );
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.accountsWithBalance(),
      });
    },
  });
};

export const useDeleteAccountTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAccountTransaction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: accountTransactionKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: accountTransactionKeys.accountsWithBalance(),
      });
    },
  });
};

export const useAccountsWithBalance = (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: accountTransactionKeys.accountsWithBalance(params),
    queryFn: async () => {
      const result = await getAccountsWithBalance(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};
