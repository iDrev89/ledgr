"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/validations/account";
import type { FinancialAccount } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type AccountWithRelations = FinancialAccount & {
  _count?: {
    salePayments: number;
    receivablePayments: number;
    purchases: number;
    transactions: number;
  };
};

const serializeAccount = (account: any): any => ({
  ...account,
  initialBalance: account.initialBalance?.toString?.() ?? "0",
});

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

export const getAccounts = async (params?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<
  ActionResponse<{ accounts: AccountWithRelations[]; total: number }>
> => {
  const t = await getTranslations("Accounts.errors");

  try {
    await requireAuth();

    const { search = "", activeOnly = false } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        {
          accountNumber: { contains: search, mode: "insensitive" as const },
        },
        { institution: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (activeOnly) {
      where.active = true;
    }

    const [accounts, total] = await Promise.all([
      prisma.financialAccount.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              salePayments: true,
              receivablePayments: true,
              purchases: true,
              transactions: true,
            },
          },
        },
      }),
      prisma.financialAccount.count({ where }),
    ]);

    return { success: true, data: { accounts: accounts.map(serializeAccount), total } };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getAccount = async (
  id: string,
): Promise<ActionResponse<AccountWithRelations>> => {
  const t = await getTranslations("Accounts.errors");

  try {
    await requireAuth();

    const account = await prisma.financialAccount.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            salePayments: true,
            receivablePayments: true,
            purchases: true,
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeAccount(account) };
  } catch (error) {
    console.error("Error fetching account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createAccount = async (
  input: CreateAccountInput,
): Promise<ActionResponse<FinancialAccount>> => {
  const t = await getTranslations("Accounts.errors");

  try {
    await requireAuth();

    const validated = createAccountSchema.parse(input);

    const existingAccount = await prisma.financialAccount.findUnique({
      where: { name: validated.name },
    });

    if (existingAccount) {
      return { success: false, error: t("duplicateName") };
    }

    const account = await prisma.financialAccount.create({
      data: {
        name: validated.name,
        type: validated.type,
        accountNumber: validated.accountNumber || null,
        institution: validated.institution || null,
        initialBalance: validated.initialBalance
          ? parseFloat(validated.initialBalance)
          : 0,
        isDefault: validated.isDefault ?? false,
        active: validated.active,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/accounts");

    return { success: true, data: serializeAccount(account) };
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateAccount = async (
  input: UpdateAccountInput,
): Promise<ActionResponse<FinancialAccount>> => {
  const t = await getTranslations("Accounts.errors");

  try {
    await requireAuth();

    const validated = updateAccountSchema.parse(input);

    const existingAccount = await prisma.financialAccount.findUnique({
      where: { id: validated.id },
    });

    if (!existingAccount) {
      return { success: false, error: t("notFound") };
    }

    if (validated.name !== existingAccount.name) {
      const duplicateAccount = await prisma.financialAccount.findUnique({
        where: { name: validated.name },
      });

      if (duplicateAccount) {
        return { success: false, error: t("duplicateName") };
      }
    }

    const account = await prisma.financialAccount.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        type: validated.type,
        accountNumber: validated.accountNumber || null,
        institution: validated.institution || null,
        initialBalance: validated.initialBalance
          ? parseFloat(validated.initialBalance)
          : 0,
        isDefault: validated.isDefault ?? false,
        active: validated.active,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/accounts");

    return { success: true, data: serializeAccount(account) };
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteAccount = async (
  id: string,
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Accounts.errors");

  try {
    await requireAuth();

    const account = await prisma.financialAccount.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            salePayments: true,
            receivablePayments: true,
            purchases: true,
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      return { success: false, error: t("notFound") };
    }

    const totalUsage =
      account._count.salePayments +
      account._count.receivablePayments +
      account._count.purchases +
      account._count.transactions;

    if (totalUsage > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.financialAccount.delete({
      where: { id },
    });

    revalidatePath("/settings");
    revalidatePath("/accounts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};
