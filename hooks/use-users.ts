import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admin } from "@/auth/auth-client";
import type { UserWithRole } from "better-auth/plugins";
import { UserRole, type UserRoleType } from "@/lib/constants";

// Re-export UserWithRole type from better-auth for convenience
export type { UserWithRole as User };

// Re-export UserRole enum
export { UserRole };

// Query Keys
export const userKeys = {
  all: ['admin-users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
} as const;

// User API functions using adminClient
const userApi = {
  async list(params?: {
    limit?: number;
    offset?: number;
    searchValue?: string;
    searchField?: "name" | "email";
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<{ users: UserWithRole[]; total: number }> {
    const result = await admin.listUsers({
      query: {
        limit: params?.limit || 100,
        offset: params?.offset || 0,
        searchValue: params?.searchValue,
        searchField: params?.searchField || "name",
        sortBy: params?.sortBy || "createdAt",
        sortDirection: params?.sortDirection || "desc",
      },
    });

    if (!result.data) {
      throw new Error("Failed to fetch users");
    }

    return {
      users: result.data.users || [],
      total: result.data.total || 0,
    };
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRoleType;
  }): Promise<UserWithRole> {
    const result = await admin.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
    });

    if (!result.data || !result.data.user) {
      throw new Error("Failed to create user");
    }

    return result.data.user;
  },

  async update(id: string, data: {
    name?: string;
    email?: string;
    role?: UserRoleType;
    banned?: boolean;
  }): Promise<UserWithRole> {
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
    banExpiresIn?: number
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
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof userApi.update>[1]) =>
      userApi.update(id, data),
    onSuccess: (updatedUser) => {
      // Update the specific user in cache
      queryClient.setQueryData(
        userKeys.detail(updatedUser.id),
        updatedUser
      );
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
