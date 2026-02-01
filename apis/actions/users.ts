"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import type { User } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

const requireAuth = async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
};

const requireAdmin = async () => {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return session;
};

export type UserWithAccess = User;

export const getUsers = async (params?: {
  search?: string;
  searchField?: "name" | "email";
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}): Promise<ActionResponse<{ users: UserWithAccess[]; total: number }>> => {
  try {
    await requireAdmin();

    const {
      search = "",
      searchField = "name",
      limit = 100,
      offset = 0,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = params || {};

    const where = search
      ? {
          [searchField]: { contains: search, mode: "insensitive" as const },
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortDirection },
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true, data: { users, total } };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
};

export const getUser = async (
  id: string,
): Promise<ActionResponse<UserWithAccess>> => {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
};

export const updateUserAccess = async (
  id: string,
  allowedAccess: boolean,
): Promise<ActionResponse<UserWithAccess>> => {
  try {
    await requireAdmin();

    const user = await prisma.user.update({
      where: { id },
      data: { allowedAccess },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating user access:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update user access",
    };
  }
};
