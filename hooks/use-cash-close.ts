import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCashCloses,
  getCashCloseById,
  createCashClose,
  deleteCashClose,
  getExpectedBalance,
} from "@/apis/actions/cash-close";
import type { CashCloseInput } from "@/lib/validations/cash-close";

export const useCashCloses = (params?: {
  accountId?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ["cash-closes", params],
    queryFn: async () => {
      const result = await getCashCloses(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useCashClose = (id: string) => {
  return useQuery({
    queryKey: ["cash-closes", id],
    queryFn: async () => {
      const result = await getCashCloseById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useExpectedBalance = (accountId: string) => {
  return useQuery({
    queryKey: ["expected-balance", accountId],
    queryFn: async () => {
      const result = await getExpectedBalance(accountId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!accountId,
  });
};

export const useCreateCashClose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CashCloseInput) => {
      const result = await createCashClose(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-closes"] });
    },
  });
};

export const useDeleteCashClose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCashClose(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-closes"] });
    },
  });
};
