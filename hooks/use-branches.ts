import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} from "@/apis/actions/branches";
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from "@/lib/validations/branch";

export const useBranches = (params?: {
  search?: string;
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ["branches", params],
    queryFn: async () => {
      const result = await getBranches(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useBranch = (id: string) => {
  return useQuery({
    queryKey: ["branches", id],
    queryFn: async () => {
      const result = await getBranch(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBranchInput) => {
      const result = await createBranch(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBranchInput) => {
      const result = await updateBranch(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({
        queryKey: ["branches", variables.id],
      });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBranch(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};
