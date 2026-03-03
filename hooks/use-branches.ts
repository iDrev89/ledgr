import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  setDefaultBranch,
  getBranchUsers,
  getUserBranches,
  assignUserToBranch,
  removeUserFromBranch,
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

export const useSetDefaultBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchId: string) => {
      const result = await setDefaultBranch(branchId);
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

export const useBranchUsers = (branchId: string) => {
  return useQuery({
    queryKey: ["branch-users", branchId],
    queryFn: async () => {
      const result = await getBranchUsers(branchId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!branchId,
  });
};

export const useUserBranches = (userId: string) => {
  return useQuery({
    queryKey: ["user-branches", userId],
    queryFn: async () => {
      const result = await getUserBranches(userId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!userId,
  });
};

export const useAssignUserToBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      branchId,
      role,
    }: {
      userId: string;
      branchId: string;
      role?: string;
    }) => {
      const result = await assignUserToBranch(userId, branchId, role);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["branch-users", variables.branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-branches", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useRemoveUserFromBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      branchId,
    }: {
      userId: string;
      branchId: string;
    }) => {
      const result = await removeUserFromBranch(userId, branchId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["branch-users", variables.branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-branches", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};
