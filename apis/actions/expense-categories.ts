"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  type CreateExpenseCategoryInput,
  type UpdateExpenseCategoryInput,
} from "@/lib/validations/expense-categories";
import type { ExpenseCategoryWithRelations } from "@/lib/types/expense-categories";

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

export const getExpenseCategories = async (params?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<ActionResponse<ExpenseCategoryWithRelations[]>> => {
  const t = await getTranslations("ExpenseCategories.errors");

  try {
    await requireAuth();

    const { search = "", activeOnly = true } = params || {};

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" as const };
    }

    if (activeOnly) {
      where.active = true;
    }

    const categories = await prisma.expenseCategory.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            expenses: true,
            expenseItems: true,
          },
        },
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getExpenseCategory = async (
  id: string
): Promise<ActionResponse<ExpenseCategoryWithRelations>> => {
  const t = await getTranslations("ExpenseCategories.errors");

  try {
    await requireAuth();

    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            expenses: true,
            expenseItems: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching expense category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createExpenseCategory = async (
  input: CreateExpenseCategoryInput
): Promise<ActionResponse<ExpenseCategoryWithRelations>> => {
  const t = await getTranslations("ExpenseCategories.errors");

  try {
    await requireAuth();

    const validated = createExpenseCategorySchema.parse(input);

    // Check if category name already exists
    const existing = await prisma.expenseCategory.findFirst({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: t("nameExists") };
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name: validated.name,
        active: validated.active,
      },
      include: {
        _count: {
          select: {
            expenses: true,
            expenseItems: true,
          },
        },
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/settings/categories");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating expense category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateExpenseCategory = async (
  input: UpdateExpenseCategoryInput
): Promise<ActionResponse<ExpenseCategoryWithRelations>> => {
  const t = await getTranslations("ExpenseCategories.errors");

  try {
    await requireAuth();

    const validated = updateExpenseCategorySchema.parse(input);

    // Check if category exists
    const existing = await prisma.expenseCategory.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    // Check if new name already exists (excluding current category)
    const nameExists = await prisma.expenseCategory.findFirst({
      where: {
        name: validated.name,
        id: { not: validated.id },
      },
    });

    if (nameExists) {
      return { success: false, error: t("nameExists") };
    }

    const category = await prisma.expenseCategory.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        active: validated.active,
      },
      include: {
        _count: {
          select: {
            expenses: true,
            expenseItems: true,
          },
        },
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/settings/categories");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating expense category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteExpenseCategory = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("ExpenseCategories.errors");

  try {
    await requireAuth();

    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: true,
        expenseItems: true,
      },
    });

    if (!category) {
      return { success: false, error: t("notFound") };
    }

    // Check if category has expenses
    if (category.expenses.length > 0 || category.expenseItems.length > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    revalidatePath("/settings/categories");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting expense category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

