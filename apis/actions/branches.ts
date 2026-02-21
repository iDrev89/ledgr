"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createBranchSchema,
  updateBranchSchema,
  type CreateBranchInput,
  type UpdateBranchInput,
} from "@/lib/validations/branch";
import type { Branch } from "@/prisma/prisma-client";
import type {
  BranchWithRelations,
  UserBranchWithRelations,
} from "@/lib/types/branch";

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

export const getBranches = async (params?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<
  ActionResponse<{ branches: BranchWithRelations[]; total: number }>
> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const { search = "", activeOnly = false } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (activeOnly) {
      where.active = true;
    }

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              financialAccounts: true,
              sales: true,
              expenses: true,
              purchases: true,
              users: true,
            },
          },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return { success: true, data: { branches, total } };
  } catch (error) {
    console.error("Error fetching branches:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getBranch = async (
  id: string
): Promise<ActionResponse<BranchWithRelations>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            financialAccounts: true,
            sales: true,
            expenses: true,
            purchases: true,
            users: true,
          },
        },
      },
    });

    if (!branch) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: branch };
  } catch (error) {
    console.error("Error fetching branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createBranch = async (
  input: CreateBranchInput
): Promise<ActionResponse<Branch>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const validated = createBranchSchema.parse(input);

    const existingBranch = await prisma.branch.findUnique({
      where: { name: validated.name },
    });

    if (existingBranch) {
      return { success: false, error: t("duplicateName") };
    }

    const branch = await prisma.$transaction(async (tx) => {
      if (validated.isDefault) {
        await tx.branch.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.branch.create({
        data: {
          name: validated.name,
          code: validated.code || null,
          address: validated.address || null,
          phone: validated.phone || null,
          active: validated.active,
          isDefault: validated.isDefault ?? false,
        },
      });
    });

    revalidatePath("/branches");

    return { success: true, data: branch };
  } catch (error) {
    console.error("Error creating branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateBranch = async (
  input: UpdateBranchInput
): Promise<ActionResponse<Branch>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const validated = updateBranchSchema.parse(input);

    const existingBranch = await prisma.branch.findUnique({
      where: { id: validated.id },
    });

    if (!existingBranch) {
      return { success: false, error: t("notFound") };
    }

    if (validated.name !== existingBranch.name) {
      const duplicateBranch = await prisma.branch.findUnique({
        where: { name: validated.name },
      });

      if (duplicateBranch) {
        return { success: false, error: t("duplicateName") };
      }
    }

    const branch = await prisma.$transaction(async (tx) => {
      if (validated.isDefault) {
        await tx.branch.updateMany({
          where: { isDefault: true, id: { not: validated.id } },
          data: { isDefault: false },
        });
      }

      return tx.branch.update({
        where: { id: validated.id },
        data: {
          name: validated.name,
          code: validated.code || null,
          address: validated.address || null,
          phone: validated.phone || null,
          active: validated.active,
          isDefault: validated.isDefault ?? false,
        },
      });
    });

    revalidatePath("/branches");

    return { success: true, data: branch };
  } catch (error) {
    console.error("Error updating branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteBranch = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            financialAccounts: true,
            sales: true,
            expenses: true,
            purchases: true,
            users: true,
          },
        },
      },
    });

    if (!branch) {
      return { success: false, error: t("notFound") };
    }

    const totalUsage =
      branch._count.financialAccounts +
      branch._count.sales +
      branch._count.expenses +
      branch._count.purchases +
      branch._count.users;

    if (totalUsage > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.branch.delete({
      where: { id },
    });

    revalidatePath("/branches");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

export const assignUserToBranch = async (
  userId: string,
  branchId: string,
  role?: string
): Promise<ActionResponse<UserBranchWithRelations>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const userBranch = await prisma.userBranch.upsert({
      where: {
        userId_branchId: { userId, branchId },
      },
      update: { role: role || null },
      create: {
        userId,
        branchId,
        role: role || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: true,
      },
    });

    revalidatePath("/branches");

    return { success: true, data: userBranch };
  } catch (error) {
    console.error("Error assigning user to branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const removeUserFromBranch = async (
  userId: string,
  branchId: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    await prisma.userBranch.delete({
      where: {
        userId_branchId: { userId, branchId },
      },
    });

    revalidatePath("/branches");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing user from branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

export const getBranchUsers = async (
  branchId: string
): Promise<ActionResponse<UserBranchWithRelations[]>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const userBranches = await prisma.userBranch.findMany({
      where: { branchId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: true,
      },
    });

    return { success: true, data: userBranches };
  } catch (error) {
    console.error("Error fetching branch users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const setDefaultBranch = async (
  branchId: string
): Promise<ActionResponse<Branch>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const branch = await prisma.$transaction(async (tx) => {
      await tx.branch.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      return tx.branch.update({
        where: { id: branchId },
        data: { isDefault: true },
      });
    });

    revalidatePath("/branches");

    return { success: true, data: branch };
  } catch (error) {
    console.error("Error setting default branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const getUserBranches = async (
  userId: string
): Promise<ActionResponse<UserBranchWithRelations[]>> => {
  const t = await getTranslations("Branches.errors");

  try {
    await requireAuth();

    const userBranches = await prisma.userBranch.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: true,
      },
    });

    return { success: true, data: userBranches };
  } catch (error) {
    console.error("Error fetching user branches:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};
