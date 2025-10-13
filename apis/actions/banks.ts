"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createBankSchema,
  updateBankSchema,
  type CreateBankInput,
  type UpdateBankInput,
} from "@/lib/validations/bank";
import type { Bank } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type BankWithRelations = Bank & {
  _count?: {
    salePayments: number;
    receivablePayments: number;
    purchasePayments: number;
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

export const getBanks = async (params?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<ActionResponse<{ banks: BankWithRelations[]; total: number }>> => {
  const t = await getTranslations("Banks.errors");

  try {
    await requireAuth();

    const { search = "", activeOnly = false } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { accountNo: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (activeOnly) {
      where.active = true;
    }

    const [banks, total] = await Promise.all([
      prisma.bank.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              salePayments: true,
              receivablePayments: true,
              purchasePayments: true,
            },
          },
        },
      }),
      prisma.bank.count({ where }),
    ]);

    return { success: true, data: { banks, total } };
  } catch (error) {
    console.error("Error fetching banks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getBank = async (
  id: string
): Promise<ActionResponse<BankWithRelations>> => {
  const t = await getTranslations("Banks.errors");

  try {
    await requireAuth();

    const bank = await prisma.bank.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            salePayments: true,
            receivablePayments: true,
            purchasePayments: true,
          },
        },
      },
    });

    if (!bank) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: bank };
  } catch (error) {
    console.error("Error fetching bank:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createBank = async (
  input: CreateBankInput
): Promise<ActionResponse<Bank>> => {
  const t = await getTranslations("Banks.errors");

  try {
    await requireAuth();

    const validated = createBankSchema.parse(input);

    // Check if bank name already exists
    const existingBank = await prisma.bank.findUnique({
      where: { name: validated.name },
    });

    if (existingBank) {
      return { success: false, error: t("duplicateName") };
    }

    const bank = await prisma.bank.create({
      data: {
        name: validated.name,
        accountNo: validated.accountNo || null,
        active: validated.active,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/banks");

    return { success: true, data: bank };
  } catch (error) {
    console.error("Error creating bank:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateBank = async (
  input: UpdateBankInput
): Promise<ActionResponse<Bank>> => {
  const t = await getTranslations("Banks.errors");

  try {
    await requireAuth();

    const validated = updateBankSchema.parse(input);

    // Check if bank exists
    const existingBank = await prisma.bank.findUnique({
      where: { id: validated.id },
    });

    if (!existingBank) {
      return { success: false, error: t("notFound") };
    }

    // Check if new name conflicts with another bank
    if (validated.name !== existingBank.name) {
      const duplicateBank = await prisma.bank.findUnique({
        where: { name: validated.name },
      });

      if (duplicateBank) {
        return { success: false, error: t("duplicateName") };
      }
    }

    const bank = await prisma.bank.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        accountNo: validated.accountNo || null,
        active: validated.active,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/banks");

    return { success: true, data: bank };
  } catch (error) {
    console.error("Error updating bank:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteBank = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Banks.errors");

  try {
    await requireAuth();

    const bank = await prisma.bank.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            salePayments: true,
            receivablePayments: true,
            purchasePayments: true,
          },
        },
      },
    });

    if (!bank) {
      return { success: false, error: t("notFound") };
    }

    const totalPayments =
      bank._count.salePayments +
      bank._count.receivablePayments +
      bank._count.purchasePayments;

    if (totalPayments > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.bank.delete({
      where: { id },
    });

    revalidatePath("/settings");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting bank:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

