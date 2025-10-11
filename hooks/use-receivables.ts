import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReceivables,
  getReceivable,
  createReceivablePayment,
  cancelReceivable,
} from "@/api/actions/receivables";
import type { CreateReceivablePaymentInput } from "@/lib/validations/receivables";

export const useReceivables = (params?: {
  search?: string;
  status?: string;
  customerId?: string;
}) => {
  return useQuery({
    queryKey: ["receivables", params],
    queryFn: async () => {
      const result = await getReceivables(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useReceivable = (id: string) => {
  return useQuery({
    queryKey: ["receivables", id],
    queryFn: async () => {
      const result = await getReceivable(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateReceivablePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReceivablePaymentInput) => {
      const result = await createReceivablePayment(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      queryClient.invalidateQueries({ queryKey: ["receivables", variables.receivableId] });
      // Invalidate banks since payment may include bank transfer
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useCancelReceivable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await cancelReceivable(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

