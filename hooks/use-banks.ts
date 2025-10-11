import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBanks, getBank, createBank, updateBank, deleteBank } from "@/api/actions/banks";
import type { CreateBankInput, UpdateBankInput } from "@/lib/validations/bank";

export const useBanks = (params?: { search?: string; activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ["banks", params],
    queryFn: async () => {
      const result = await getBanks(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useBank = (id: string) => {
  return useQuery({
    queryKey: ["banks", id],
    queryFn: async () => {
      const result = await getBank(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBankInput) => {
      const result = await createBank(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });
};

export const useUpdateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBankInput) => {
      const result = await updateBank(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["banks", variables.id] });
    },
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBank(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });
};

