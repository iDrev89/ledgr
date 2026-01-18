"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createExpenseSchema,
  updateExpenseSchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validations/expenses";
import type { ExpenseWithDetails } from "@/lib/types/expenses";
import { Decimal } from "@prisma/client/runtime/library";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Serialize Decimal fields to strings for client components
const serializeExpense = (expense: any): any => {
  return {
    ...expense,
    amount: expense.amount.toString(),
    items: expense.items
      ? expense.items.map((item: any) => ({
          ...item,
          quantity: item.quantity.toString(),
          unitAmount: item.unitAmount.toString(),
          taxPercent: item.taxPercent.toString(),
          lineTotal: item.lineTotal.toString(),
        }))
      : undefined,
    attachment: expense.attachment || null,
  };
};

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

export const getExpenses = async (params?: {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{ expenses: ExpenseWithDetails[]; total: number }>
> => {
  const t = await getTranslations("Expenses.errors");

  try {
    await requireAuth();

    const {
      search = "",
      categoryId,
      supplierId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" as const } },
        { invoiceNo: { contains: search, mode: "insensitive" as const } },
        {
          supplier: {
            name: { contains: search, mode: "insensitive" as const },
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate || endDate) {
      where.incurredAt = {};
      if (startDate) {
        where.incurredAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.incurredAt.lte = new Date(endDate);
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { incurredAt: "desc" },
        include: {
          category: true,
          supplier: true,
          bank: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const serializedExpenses = expenses.map(serializeExpense);

    return { success: true, data: { expenses: serializedExpenses, total } };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getExpense = async (
  id: string,
): Promise<ActionResponse<ExpenseWithDetails>> => {
  const t = await getTranslations("Expenses.errors");

  try {
    await requireAuth();

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        bank: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!expense) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeExpense(expense) };
  } catch (error) {
    console.error("Error fetching expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createExpense = async (
  input: CreateExpenseInput,
): Promise<ActionResponse<ExpenseWithDetails>> => {
  const t = await getTranslations("Expenses.errors");

  try {
    const session = await requireAuth();

    const validated = createExpenseSchema.parse(input);

    // Verify category exists if provided
    if (validated.categoryId) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: validated.categoryId },
      });

      if (!category) {
        return { success: false, error: t("categoryNotFound") };
      }

      if (!category.active) {
        return { success: false, error: t("categoryInactive") };
      }
    }

    // Verify supplier exists if provided
    if (validated.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: validated.supplierId },
      });

      if (!supplier) {
        return { success: false, error: t("supplierNotFound") };
      }
    }

    const amount = new Decimal(validated.amount);
    const incurredAt =
      typeof validated.incurredAt === "string"
        ? new Date(validated.incurredAt)
        : validated.incurredAt;

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          createdById: session.user.id,
          categoryId: validated.categoryId || null,
          supplierId: validated.supplierId || null,
          description: validated.description || null,
          invoiceNo: validated.invoiceNo || null,
          currency: "COP",
          amount,
          paymentMethod: validated.paymentMethod,
          bankId: validated.bankId || null,
          reference: validated.reference || null,
          incurredAt,
          attachment: validated.attachment || null,
        },
        include: {
          category: true,
          supplier: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
      });

      // Create bank transaction if payment method is TRANSFER and bank is provided
      if (validated.paymentMethod === "TRANSFER" && validated.bankId) {
        await tx.bankTransaction.create({
          data: {
            bankId: validated.bankId,
            type: "EXPENSE" as any,
            amount: amount.negated(), // Negative because it's an expense
            description: `Gasto${validated.description ? `: ${validated.description}` : ""}${validated.invoiceNo ? ` (Factura: ${validated.invoiceNo})` : ""}`,
            reference: validated.reference || null,
            transactionDate: incurredAt,
            expenseId: expense.id,
            createdById: session.user.id,
          },
        });
      }

      return expense;
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/banks");
    revalidatePath("/reports");

    return { success: true, data: serializeExpense(result) };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateExpense = async (
  input: UpdateExpenseInput,
): Promise<ActionResponse<ExpenseWithDetails>> => {
  const t = await getTranslations("Expenses.errors");

  try {
    await requireAuth();

    const validated = updateExpenseSchema.parse(input);

    // Check if expense exists
    const existing = await prisma.expense.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    // Verify category exists if provided
    if (validated.categoryId) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: validated.categoryId },
      });

      if (!category) {
        return { success: false, error: t("categoryNotFound") };
      }

      if (!category.active) {
        return { success: false, error: t("categoryInactive") };
      }
    }

    // Verify supplier exists if provided
    if (validated.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: validated.supplierId },
      });

      if (!supplier) {
        return { success: false, error: t("supplierNotFound") };
      }
    }

    const amount = new Decimal(validated.amount);
    const incurredAt =
      typeof validated.incurredAt === "string"
        ? new Date(validated.incurredAt)
        : validated.incurredAt;

    const expense = await prisma.expense.update({
      where: { id: validated.id },
      data: {
        categoryId: validated.categoryId || null,
        supplierId: validated.supplierId || null,
        description: validated.description || null,
        invoiceNo: validated.invoiceNo || null,
        amount,
        paymentMethod: validated.paymentMethod,
        bankId: validated.bankId || null,
        reference: validated.reference || null,
        incurredAt,
        attachment: validated.attachment || null,
      },
      include: {
        category: true,
        supplier: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    revalidatePath("/expenses");
    revalidatePath(`/expenses/${expense.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/banks");
    revalidatePath("/reports");

    return { success: true, data: serializeExpense(expense) };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteExpense = async (
  id: string,
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Expenses.errors");

  try {
    await requireAuth();

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!expense) {
      return { success: false, error: t("notFound") };
    }

    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/banks");
    revalidatePath("/reports");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};
