"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createReconciliationSchema,
  updateReconciliationItemSchema,
  importStatementSchema,
  type CreateReconciliationInput,
  type UpdateReconciliationItemInput,
  type ImportStatementInput,
} from "@/lib/validations/reconciliation";
import type {
  ReconciliationWithRelations,
  ReconciliationItemWithRelations,
} from "@/lib/types/reconciliation";
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

const serializeDecimal = (val: any): string =>
  val?.toString?.() ?? "0";

const serializeItem = (item: any): ReconciliationItemWithRelations => ({
  ...item,
  externalAmount: item.externalAmount ? serializeDecimal(item.externalAmount) : null,
  transaction: item.transaction
    ? {
        ...item.transaction,
        amount: serializeDecimal(item.transaction.amount),
      }
    : null,
});

const serializeReconciliation = (rec: any): ReconciliationWithRelations => ({
  ...rec,
  openingBalance: serializeDecimal(rec.openingBalance),
  closingBalance: serializeDecimal(rec.closingBalance),
  statementBalance: serializeDecimal(rec.statementBalance),
  difference: serializeDecimal(rec.difference),
  items: rec.items?.map(serializeItem) ?? [],
});

export const createReconciliation = async (
  data: CreateReconciliationInput
): Promise<ActionResponse<ReconciliationWithRelations>> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    await requireAuth();
    const validated = createReconciliationSchema.parse(data);

    const account = await prisma.financialAccount.findUnique({
      where: { id: validated.accountId },
    });

    if (!account) {
      return { success: false, error: t("accountNotFound") };
    }

    const transactionsBefore = await prisma.accountTransaction.aggregate({
      where: {
        accountId: validated.accountId,
        transactionDate: { lt: validated.periodStart },
      },
      _sum: { amount: true },
    });

    const transactionsInPeriod = await prisma.accountTransaction.aggregate({
      where: {
        accountId: validated.accountId,
        transactionDate: {
          gte: validated.periodStart,
          lte: validated.periodEnd,
        },
      },
      _sum: { amount: true },
    });

    const initialBalance = account.initialBalance ?? new Decimal(0);
    const openingBalance = initialBalance.add(
      transactionsBefore._sum.amount ?? new Decimal(0)
    );
    const closingBalance = openingBalance.add(
      transactionsInPeriod._sum.amount ?? new Decimal(0)
    );
    const statementBalance = new Decimal(validated.statementBalance);
    const difference = closingBalance.minus(statementBalance);

    const periodTransactions = await prisma.accountTransaction.findMany({
      where: {
        accountId: validated.accountId,
        transactionDate: {
          gte: validated.periodStart,
          lte: validated.periodEnd,
        },
      },
      select: { id: true },
    });

    const reconciliation = await prisma.accountReconciliation.create({
      data: {
        accountId: validated.accountId,
        periodStart: validated.periodStart,
        periodEnd: validated.periodEnd,
        openingBalance,
        closingBalance,
        statementBalance,
        difference,
        notes: validated.notes ?? null,
        items: {
          create: periodTransactions.map((tx) => ({
            transactionId: tx.id,
            status: "UNMATCHED",
          })),
        },
      },
      include: {
        account: { select: { id: true, name: true, type: true } },
        reconciledBy: { select: { id: true, name: true } },
        items: {
          include: {
            transaction: {
              select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                transactionDate: true,
                reference: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/reconciliation");
    return { success: true, data: serializeReconciliation(reconciliation) };
  } catch {
    return { success: false, error: t("createFailed") };
  }
};

export const getReconciliations = async (params?: {
  accountId?: string;
  status?: string;
}): Promise<
  ActionResponse<{
    reconciliations: ReconciliationWithRelations[];
    total: number;
  }>
> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    await requireAuth();

    const where: any = {};

    if (params?.accountId) {
      where.accountId = params.accountId;
    }
    if (params?.status) {
      where.status = params.status;
    }

    const [reconciliations, total] = await Promise.all([
      prisma.accountReconciliation.findMany({
        where,
        include: {
          account: { select: { id: true, name: true, type: true } },
          reconciledBy: { select: { id: true, name: true } },
          items: {
            include: {
              transaction: {
                select: {
                  id: true,
                  type: true,
                  amount: true,
                  description: true,
                  transactionDate: true,
                  reference: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.accountReconciliation.count({ where }),
    ]);

    return {
      success: true,
      data: {
        reconciliations: reconciliations.map(serializeReconciliation),
        total,
      },
    };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const getReconciliationById = async (
  id: string
): Promise<ActionResponse<ReconciliationWithRelations>> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    await requireAuth();

    const reconciliation = await prisma.accountReconciliation.findUnique({
      where: { id },
      include: {
        account: { select: { id: true, name: true, type: true } },
        reconciledBy: { select: { id: true, name: true } },
        items: {
          include: {
            transaction: {
              select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                transactionDate: true,
                reference: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!reconciliation) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeReconciliation(reconciliation) };
  } catch {
    return { success: false, error: t("fetchFailed") };
  }
};

export const updateReconciliationItem = async (
  data: UpdateReconciliationItemInput
): Promise<ActionResponse<ReconciliationItemWithRelations>> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    await requireAuth();
    const validated = updateReconciliationItemSchema.parse(data);

    const item = await prisma.reconciliationItem.update({
      where: { id: validated.id },
      data: {
        status: validated.status,
        transactionId: validated.transactionId ?? null,
      },
      include: {
        transaction: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            transactionDate: true,
            reference: true,
          },
        },
      },
    });

    revalidatePath("/reconciliation");
    return { success: true, data: serializeItem(item) };
  } catch {
    return { success: false, error: t("updateFailed") };
  }
};

export const completeReconciliation = async (
  id: string
): Promise<ActionResponse<ReconciliationWithRelations>> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    const session = await requireAuth();

    const reconciliation = await prisma.accountReconciliation.update({
      where: { id },
      data: {
        status: "COMPLETED",
        reconciledAt: new Date(),
        reconciledById: session.user.id,
      },
      include: {
        account: { select: { id: true, name: true, type: true } },
        reconciledBy: { select: { id: true, name: true } },
        items: {
          include: {
            transaction: {
              select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                transactionDate: true,
                reference: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/reconciliation");
    return { success: true, data: serializeReconciliation(reconciliation) };
  } catch {
    return { success: false, error: t("completeFailed") };
  }
};

export const importStatementItems = async (
  data: ImportStatementInput
): Promise<ActionResponse<ReconciliationItemWithRelations[]>> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    await requireAuth();
    const validated = importStatementSchema.parse(data);

    const reconciliation = await prisma.accountReconciliation.findUnique({
      where: { id: validated.reconciliationId },
    });

    if (!reconciliation) {
      return { success: false, error: t("notFound") };
    }

    const items = await prisma.$transaction(
      validated.items.map((item) =>
        prisma.reconciliationItem.create({
          data: {
            reconciliationId: validated.reconciliationId,
            externalRef: item.externalRef ?? null,
            externalAmount: new Decimal(item.externalAmount),
            externalDate: item.externalDate,
            status: "UNMATCHED",
          },
          include: {
            transaction: {
              select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                transactionDate: true,
                reference: true,
              },
            },
          },
        })
      )
    );

    revalidatePath("/reconciliation");
    return { success: true, data: items.map(serializeItem) };
  } catch {
    return { success: false, error: t("importFailed") };
  }
};

export const deleteReconciliation = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Reconciliation.errors");

  try {
    await requireAuth();

    const reconciliation = await prisma.accountReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation) {
      return { success: false, error: t("notFound") };
    }

    if (reconciliation.status === "COMPLETED") {
      return { success: false, error: t("cannotDeleteCompleted") };
    }

    await prisma.accountReconciliation.delete({ where: { id } });

    revalidatePath("/reconciliation");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: t("deleteFailed") };
  }
};
