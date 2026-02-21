"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  cashCloseSchema,
  type CashCloseInput,
} from "@/lib/validations/cash-close";
import type { CashCloseWithRelations } from "@/lib/types/cash-close";
import { Decimal } from "@prisma/client/runtime/library";

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

const serializeCashClose = (close: any): CashCloseWithRelations => ({
  ...close,
  expectedBalance: close.expectedBalance.toString(),
  actualBalance: close.actualBalance.toString(),
  difference: close.difference.toString(),
});

export const getExpectedBalance = async (
  accountId: string
): Promise<ActionResponse<{ expectedBalance: string }>> => {
  const t = await getTranslations("CashClose.errors");

  try {
    await requireAuth();

    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { success: false, error: t("notFound") };
    }

    const transactions = await prisma.accountTransaction.aggregate({
      where: { accountId },
      _sum: { amount: true },
    });

    const transactionTotal = transactions._sum.amount ?? new Decimal(0);
    const initialBalance = account.initialBalance ?? new Decimal(0);
    const expectedBalance = initialBalance.add(transactionTotal);

    return {
      success: true,
      data: { expectedBalance: expectedBalance.toString() },
    };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const createCashClose = async (
  data: CashCloseInput
): Promise<ActionResponse<CashCloseWithRelations>> => {
  const t = await getTranslations("CashClose.errors");

  try {
    const session = await requireAuth();
    const validated = cashCloseSchema.parse(data);

    const account = await prisma.financialAccount.findUnique({
      where: { id: validated.accountId },
    });

    if (!account) {
      return { success: false, error: t("accountNotFound") };
    }

    const transactions = await prisma.accountTransaction.aggregate({
      where: { accountId: validated.accountId },
      _sum: { amount: true },
    });

    const transactionTotal = transactions._sum.amount ?? new Decimal(0);
    const initialBalance = account.initialBalance ?? new Decimal(0);
    const expectedBalance = initialBalance.add(transactionTotal);
    const actualBalance = new Decimal(validated.actualBalance);
    const difference = actualBalance.minus(expectedBalance);

    const cashClose = await prisma.cashRegisterClose.create({
      data: {
        accountId: validated.accountId,
        branchId: validated.branchId ?? null,
        expectedBalance,
        actualBalance,
        difference,
        notes: validated.notes ?? null,
        closedById: session.user.id,
      },
      include: {
        account: { select: { id: true, name: true, type: true } },
        closedBy: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/cash-close");
    return { success: true, data: serializeCashClose(cashClose) };
  } catch {
    return { success: false, error: t("createFailed") };
  }
};

export const getCashCloses = async (params?: {
  accountId?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<
  ActionResponse<{ cashCloses: CashCloseWithRelations[]; total: number }>
> => {
  const t = await getTranslations("CashClose.errors");

  try {
    await requireAuth();

    const where: any = {};

    if (params?.accountId) {
      where.accountId = params.accountId;
    }
    if (params?.branchId) {
      where.branchId = params.branchId;
    }
    if (params?.dateFrom || params?.dateTo) {
      where.closeDate = {};
      if (params.dateFrom) {
        where.closeDate.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.closeDate.lte = new Date(params.dateTo);
      }
    }

    const [cashCloses, total] = await Promise.all([
      prisma.cashRegisterClose.findMany({
        where,
        include: {
          account: { select: { id: true, name: true, type: true } },
          closedBy: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { closeDate: "desc" },
      }),
      prisma.cashRegisterClose.count({ where }),
    ]);

    return {
      success: true,
      data: {
        cashCloses: cashCloses.map(serializeCashClose),
        total,
      },
    };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const getCashCloseById = async (
  id: string
): Promise<ActionResponse<CashCloseWithRelations>> => {
  const t = await getTranslations("CashClose.errors");

  try {
    await requireAuth();

    const cashClose = await prisma.cashRegisterClose.findUnique({
      where: { id },
      include: {
        account: { select: { id: true, name: true, type: true } },
        closedBy: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!cashClose) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeCashClose(cashClose) };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const deleteCashClose = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("CashClose.errors");

  try {
    await requireAuth();

    await prisma.cashRegisterClose.delete({ where: { id } });

    revalidatePath("/cash-close");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: t("deleteFailed") };
  }
};
