"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  openSessionSchema,
  closeSessionSchema,
  type OpenSessionInput,
  type CloseSessionInput,
} from "@/lib/validations/cash-session";
import type {
  CashSessionWithRelations,
  CashSessionTurnSummary,
} from "@/lib/types/cash-session";
import { Decimal } from "@prisma/client/runtime/library";
import { AccountTransactionType } from "@/prisma/prisma-client";

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

const sessionIncludes = {
  account: { select: { id: true, name: true, type: true } },
  openedBy: { select: { id: true, name: true } },
  closedBy: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
  depositAccount: { select: { id: true, name: true, type: true } },
} as const;

const serializeCashSession = (session: any): CashSessionWithRelations => ({
  ...session,
  openingBalance: session.openingBalance.toString(),
  expectedBalance: session.expectedBalance?.toString() ?? null,
  actualBalance: session.actualBalance?.toString() ?? null,
  difference: session.difference?.toString() ?? null,
  retainedAmount: session.retainedAmount?.toString() ?? null,
  depositAmount: session.depositAmount?.toString() ?? null,
});

export const getActiveCashSession = async (
  accountId?: string,
): Promise<ActionResponse<CashSessionWithRelations | null>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const where: any = { status: "OPEN" };
    if (accountId) {
      where.accountId = accountId;
    }

    const session = await prisma.cashSession.findFirst({
      where,
      include: sessionIncludes,
      orderBy: { openedAt: "desc" },
    });

    if (!session) {
      return { success: true, data: null };
    }

    return { success: true, data: serializeCashSession(session) };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const openCashSession = async (
  input: OpenSessionInput,
): Promise<ActionResponse<CashSessionWithRelations>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    const authSession = await requireAuth();
    const validated = openSessionSchema.parse(input);

    const account = await prisma.financialAccount.findUnique({
      where: { id: validated.accountId },
    });

    if (!account) {
      return { success: false, error: t("accountNotFound") };
    }

    const existingOpen = await prisma.cashSession.findFirst({
      where: { accountId: validated.accountId, status: "OPEN" },
    });

    if (existingOpen) {
      return { success: false, error: t("sessionAlreadyOpen") };
    }

    const cashSession = await prisma.cashSession.create({
      data: {
        accountId: validated.accountId,
        branchId: validated.branchId ?? null,
        openedById: authSession.user.id,
        openingBalance: new Decimal(validated.openingBalance),
        openingNotes: validated.openingNotes || null,
      },
      include: sessionIncludes,
    });

    revalidatePath("/cash-register");
    return { success: true, data: serializeCashSession(cashSession) };
  } catch {
    return { success: false, error: t("openFailed") };
  }
};

export const closeCashSession = async (
  input: CloseSessionInput,
): Promise<ActionResponse<CashSessionWithRelations>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    const authSession = await requireAuth();
    const validated = closeSessionSchema.parse(input);

    const cashSession = await prisma.cashSession.findUnique({
      where: { id: validated.sessionId },
      include: { account: true },
    });

    if (!cashSession) {
      return { success: false, error: t("notFound") };
    }

    if (cashSession.status === "CLOSED") {
      return { success: false, error: t("sessionAlreadyClosed") };
    }

    const transactions = await prisma.accountTransaction.aggregate({
      where: { accountId: cashSession.accountId },
      _sum: { amount: true },
    });

    const transactionTotal = transactions._sum.amount ?? new Decimal(0);
    const initialBalance =
      cashSession.account.initialBalance ?? new Decimal(0);
    const expectedBalance = initialBalance.add(transactionTotal);

    const actualBalance = new Decimal(validated.actualBalance);
    const retainedAmount = new Decimal(validated.retainedAmount);
    const difference = actualBalance.minus(expectedBalance);
    const depositAmount = actualBalance.minus(retainedAmount);

    const shouldDeposit =
      depositAmount.gt(0) &&
      validated.depositAccountId &&
      validated.depositAccountId.trim() !== "";

    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.cashSession.update({
        where: { id: validated.sessionId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          closedById: authSession.user.id,
          expectedBalance,
          actualBalance,
          difference,
          retainedAmount,
          depositAmount: shouldDeposit ? depositAmount : new Decimal(0),
          depositAccountId: shouldDeposit
            ? validated.depositAccountId
            : null,
          closingNotes: validated.closingNotes || null,
        },
        include: sessionIncludes,
      });

      if (shouldDeposit) {
        const depositAccount = await tx.financialAccount.findUnique({
          where: { id: validated.depositAccountId! },
        });

        if (!depositAccount) {
          throw new Error(t("depositAccountNotFound"));
        }

        const outTransaction = await tx.accountTransaction.create({
          data: {
            accountId: cashSession.accountId,
            type: AccountTransactionType.TRANSFER_OUT,
            amount: depositAmount.negated(),
            description: `Depósito cierre de caja - ${cashSession.account.name}`,
            transactionDate: new Date(),
            relatedAccountId: validated.depositAccountId!,
            createdById: authSession.user.id,
          },
        });

        await tx.accountTransaction.create({
          data: {
            accountId: validated.depositAccountId!,
            type: AccountTransactionType.TRANSFER_IN,
            amount: depositAmount,
            description: `Depósito cierre de caja desde ${cashSession.account.name}`,
            transactionDate: new Date(),
            relatedAccountId: cashSession.accountId,
            transferPairId: outTransaction.id,
            createdById: authSession.user.id,
          },
        });
      }

      return updatedSession;
    });

    revalidatePath("/cash-register");
    revalidatePath("/accounts");
    return { success: true, data: serializeCashSession(result) };
  } catch (error) {
    console.error("Error closing cash session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("closeFailed"),
    };
  }
};

export const getCashSessions = async (params?: {
  accountId?: string;
  branchId?: string;
  status?: "OPEN" | "CLOSED";
  dateFrom?: string;
  dateTo?: string;
}): Promise<
  ActionResponse<{ sessions: CashSessionWithRelations[]; total: number }>
> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const where: any = {};

    if (params?.accountId) where.accountId = params.accountId;
    if (params?.branchId) where.branchId = params.branchId;
    if (params?.status) where.status = params.status;
    if (params?.dateFrom || params?.dateTo) {
      where.openedAt = {};
      if (params?.dateFrom) where.openedAt.gte = new Date(params.dateFrom);
      if (params?.dateTo) where.openedAt.lte = new Date(params.dateTo);
    }

    const [sessions, total] = await Promise.all([
      prisma.cashSession.findMany({
        where,
        include: sessionIncludes,
        orderBy: { openedAt: "desc" },
      }),
      prisma.cashSession.count({ where }),
    ]);

    return {
      success: true,
      data: {
        sessions: sessions.map(serializeCashSession),
        total,
      },
    };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const getCashSessionById = async (
  id: string,
): Promise<ActionResponse<CashSessionWithRelations>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const session = await prisma.cashSession.findUnique({
      where: { id },
      include: sessionIncludes,
    });

    if (!session) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeCashSession(session) };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const getLastClosedSession = async (
  accountId: string,
): Promise<ActionResponse<CashSessionWithRelations | null>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const session = await prisma.cashSession.findFirst({
      where: { accountId, status: "CLOSED" },
      include: sessionIncludes,
      orderBy: { closedAt: "desc" },
    });

    if (!session) {
      return { success: true, data: null };
    }

    return { success: true, data: serializeCashSession(session) };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const getSessionTurnSummary = async (
  sessionId: string,
): Promise<ActionResponse<CashSessionTurnSummary>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { account: true },
    });

    if (!session) {
      return { success: false, error: t("notFound") };
    }

    const incomeAgg = await prisma.accountTransaction.aggregate({
      where: {
        accountId: session.accountId,
        transactionDate: { gte: session.openedAt },
        type: { in: ["INCOME", "TRANSFER_IN"] },
      },
      _sum: { amount: true },
      _count: true,
    });

    const expenseAgg = await prisma.accountTransaction.aggregate({
      where: {
        accountId: session.accountId,
        transactionDate: { gte: session.openedAt },
        type: { in: ["EXPENSE", "TRANSFER_OUT"] },
      },
      _sum: { amount: true },
      _count: true,
    });

    const incomeTotal = incomeAgg._sum.amount ?? new Decimal(0);
    const expenseTotal = expenseAgg._sum.amount ?? new Decimal(0);
    const transactionCount = incomeAgg._count + expenseAgg._count;

    const expectedBalance = session.openingBalance
      .add(incomeTotal)
      .add(expenseTotal);

    return {
      success: true,
      data: {
        incomeTotal: incomeTotal.toString(),
        expenseTotal: expenseTotal.abs().toString(),
        transactionCount,
        expectedBalance: expectedBalance.toString(),
      },
    };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const getExpectedBalance = async (
  accountId: string,
): Promise<ActionResponse<{ expectedBalance: string }>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { success: false, error: t("accountNotFound") };
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

export const deleteCashSession = async (
  id: string,
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("CashRegister.errors");

  try {
    await requireAuth();

    const session = await prisma.cashSession.findUnique({
      where: { id },
    });

    if (!session) {
      return { success: false, error: t("notFound") };
    }

    if (session.status === "CLOSED") {
      return { success: false, error: t("cannotDeleteClosed") };
    }

    await prisma.cashSession.delete({ where: { id } });

    revalidatePath("/cash-register");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: t("deleteFailed") };
  }
};
