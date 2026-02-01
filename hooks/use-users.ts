import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admin } from "@/auth/auth-client";
import type { UserWithRole } from "better-auth/plugins";
import { UserRole, type UserRoleType } from "@/lib/constants";
import {
  getUsers as getUsersAction,
  updateUserAccess,
  type UserWithAccess,
} from "@/apis/actions/users";

// Extended User type that includes allowedAccess
export type User = UserWithRole & { allowedAccess?: boolean };

// Re-export UserRole enum
export { UserRole };

// Query Keys
export const userKeys = {
  all: ["admin-users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
} as const;

// User API functions using server actions and adminClient
const userApi = {
  async list(params?: {
    limit?: number;
    offset?: number;
    searchValue?: string;
    searchField?: "name" | "email";
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<{ users: User[]; total: number }> {
    // Use server action to get users with allowedAccess field
    const result = await getUsersAction({
      limit: params?.limit || 100,
      offset: params?.offset || 0,
      search: params?.searchValue,
      searchField: params?.searchField || "name",
      sortBy: params?.sortBy || "createdAt",
      sortDirection: params?.sortDirection || "desc",
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch users");
    }

    return {
      users: result.data.users as User[],
      total: result.data.total,
    };
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRoleType;
    allowedAccess?: boolean;
  }): Promise<UserWithRole> {
    const result = await admin.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
      data: {
        allowedAccess: data.allowedAccess ?? true, // Default to true for manually created users
      },
    });

    if (!result.data || !result.data.user) {
      throw new Error("Failed to create user");
    }

    return result.data.user;
  },

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: UserRoleType;
      banned?: boolean;
      allowedAccess?: boolean;
    },
  ): Promise<UserWithRole> {
    const result = await admin.updateUser({
      userId: id,
      data: data, // Must be wrapped in 'data' property as per Better Auth docs
    });

    if (!result.data) {
      throw new Error("Failed to update user");
    }

    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await admin.removeUser({
      userId: id,
    });

    if (!result.data) {
      throw new Error("Failed to delete user");
    }
  },

  async toggleBan(
    id: string,
    banned: boolean,
    banReason?: string,
    banExpiresIn?: number,
  ): Promise<void> {
    if (banned) {
      // Use banUser method as per Better Auth docs
      const result = await admin.banUser({
        userId: id,
        banReason: banReason || "No reason provided",
        banExpiresIn: banExpiresIn, // in seconds
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to ban user");
      }
    } else {
      // Use unbanUser method as per Better Auth docs
      const result = await admin.unbanUser({
        userId: id,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to unban user");
      }
    }
  },
};

// Hooks
export function useUsers(params?: {
  limit?: number;
  offset?: number;
  searchValue?: string;
  searchField?: "name" | "email";
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
    placeholderData: (previousData) => previousData, // TanStack Query v5 replacement for keepPreviousData
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Parameters<typeof userApi.update>[1]) =>
      userApi.update(id, data),
    onSuccess: (updatedUser) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: userKeys.detail(deletedId),
      });
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

export function useToggleUserBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      banned,
      banReason,
      banExpiresIn,
    }: {
      id: string;
      banned: boolean;
      banReason?: string;
      banExpiresIn?: number;
    }) => userApi.toggleBan(id, banned, banReason, banExpiresIn),
    onSuccess: (data, variables) => {
      // Invalidate the specific user and lists to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

export function useToggleAllowedAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      allowedAccess,
    }: {
      id: string;
      allowedAccess: boolean;
    }) => {
      const result = await updateUserAccess(id, allowedAccess);
      if (!result.success) {
        throw new Error(result.error || "Failed to update user access");
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific user and lists to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
