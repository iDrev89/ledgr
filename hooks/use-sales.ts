import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  completeSale,
  getEmployeeSalesStats,
} from "@/apis/actions/sales";
import type { CreateSaleInput, UpdateSaleInput } from "@/lib/validations/sales";
import { inventoryKeys } from "./use-inventory";

export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...saleKeys.lists(), filters] as const,
  detail: (id: string) => [...saleKeys.all, "detail", id] as const,
  stats: () => [...saleKeys.all, "stats"] as const,
} as const;

export function useEmployeeSalesStats(params?: { sellerId?: string }) {
  return useQuery({
    queryKey: [...saleKeys.stats(), params],
    queryFn: async () => {
      const result = await getEmployeeSalesStats(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useSales(params?: {
  search?: string;
  customerId?: string;
  sellerId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: "DRAFT" | "COMPLETED" | "ALL";
  paymentMethod?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: async () => {
      const result = await getSales(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: async () => {
      const result = await getSale(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      isDraft,
    }: {
      input: CreateSaleInput;
      isDraft?: boolean;
    }) => {
      const result = await createSale(input, isDraft);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });
      // Invalidate inventory queries since stock was updated
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.lists(),
      });
      // Invalidate banks since payments may include bank transfers
      queryClient.invalidateQueries({
        queryKey: ["banks"],
      });
      // Invalidate receivables since a new receivable may have been created
      queryClient.invalidateQueries({
        queryKey: ["receivables"],
      });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate reports for updated data
      queryClient.invalidateQueries({
        queryKey: ["daily-sales-report"],
      });
      queryClient.invalidateQueries({
        queryKey: ["business-summary-enhanced"],
      });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSaleInput) => {
      const result = await updateSale(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedSale) => {
      queryClient.setQueryData(saleKeys.detail(updatedSale.id), updatedSale);
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });
      // Invalidate inventory queries since stock was updated
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.lists(),
      });
      // Invalidate banks since payments may include bank transfers
      queryClient.invalidateQueries({
        queryKey: ["banks"],
      });
      // Invalidate receivables since receivable may have been updated
      queryClient.invalidateQueries({
        queryKey: ["receivables"],
      });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate reports for updated data
      queryClient.invalidateQueries({
        queryKey: ["daily-sales-report"],
      });
      queryClient.invalidateQueries({
        queryKey: ["business-summary-enhanced"],
      });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSale(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: saleKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });
      // Invalidate inventory queries since stock was restored
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.lists(),
      });
      // Invalidate banks in case payments included bank transfers
      queryClient.invalidateQueries({
        queryKey: ["banks"],
      });
      // Invalidate receivables in case sale had a receivable
      queryClient.invalidateQueries({
        queryKey: ["receivables"],
      });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate reports for updated data
      queryClient.invalidateQueries({
        queryKey: ["daily-sales-report"],
      });
      queryClient.invalidateQueries({
        queryKey: ["business-summary-enhanced"],
      });
    },
  });
}

export function useCompleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      const result = await completeSale(saleId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (completedSale) => {
      queryClient.setQueryData(
        saleKeys.detail(completedSale.id),
        completedSale,
      );
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });
      // Invalidate inventory queries since stock was updated
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.lists(),
      });
      // Invalidate banks since payments may include bank transfers
      queryClient.invalidateQueries({
        queryKey: ["banks"],
      });
      // Invalidate receivables since a receivable may have been created
      queryClient.invalidateQueries({
        queryKey: ["receivables"],
      });
      // Invalidate dashboard for updated stats
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate reports for updated data
      queryClient.invalidateQueries({
        queryKey: ["daily-sales-report"],
      });
      queryClient.invalidateQueries({
        queryKey: ["business-summary-enhanced"],
      });
    },
  });
}
