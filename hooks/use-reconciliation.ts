import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReconciliations,
  getReconciliationById,
  createReconciliation,
  deleteReconciliation,
  completeReconciliation,
  updateReconciliationItem,
  importStatementItems,
} from "@/apis/actions/reconciliation";
import type { CreateReconciliationInput, UpdateReconciliationItemInput, ImportStatementInput } from "@/lib/validations/reconciliation";

export const useReconciliations = (params?: {
  accountId?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["reconciliations", params],
    queryFn: async () => {
      const result = await getReconciliations(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useReconciliation = (id: string) => {
  return useQuery({
    queryKey: ["reconciliations", id],
    queryFn: async () => {
      const result = await getReconciliationById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReconciliationInput) => {
      const result = await createReconciliation(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliations"] });
    },
  });
};

export const useCompleteReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await completeReconciliation(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["reconciliations"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliations", id] });
    },
  });
};

export const useUpdateReconciliationItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateReconciliationItemInput) => {
      const result = await updateReconciliationItem(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliations"] });
    },
  });
};

export const useImportStatementItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ImportStatementInput) => {
      const result = await importStatementItems(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliations"] });
    },
  });
};

export const useDeleteReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteReconciliation(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliations"] });
    },
  });
};
