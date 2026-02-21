"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createTransactionSchema,
  updateTransactionSchema,
  createTransferSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type CreateTransferInput,
} from "@/lib/validations/account-transactions";
import type {
  AccountTransactionWithRelations,
  AccountWithBalance,
} from "@/lib/types/account-transactions";
import { Decimal } from "@prisma/client/runtime/library";

enum AccountTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUSTMENT = "ADJUSTMENT",
}

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

const serializeTransaction = (transaction: any): any => {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
    salePayment: transaction.salePayment
      ? {
          ...transaction.salePayment,
          amount: transaction.salePayment.amount.toString(),
          sale: transaction.salePayment.sale
            ? {
                ...transaction.salePayment.sale,
                subtotal: transaction.salePayment.sale.subtotal?.toString(),
                discountTotal:
                  transaction.salePayment.sale.discountTotal?.toString(),
                taxTotal: transaction.salePayment.sale.taxTotal?.toString(),
                total: transaction.salePayment.sale.total?.toString(),
              }
            : undefined,
        }
      : undefined,
    receivablePayment: transaction.receivablePayment
      ? {
          ...transaction.receivablePayment,
          amount: transaction.receivablePayment.amount.toString(),
          receivable: transaction.receivablePayment.receivable
            ? {
                ...transaction.receivablePayment.receivable,
                total:
                  transaction.receivablePayment.receivable.total?.toString(),
                balance:
                  transaction.receivablePayment.receivable.balance?.toString(),
              }
            : undefined,
        }
      : undefined,
    expense: transaction.expense
      ? {
          ...transaction.expense,
          amount: transaction.expense.amount.toString(),
        }
      : undefined,
  };
};

export const getAccountTransactions = async (params?: {
  accountId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{
    transactions: AccountTransactionWithRelations[];
    total: number;
  }>
> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    await requireAuth();

    const {
      accountId,
      type,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (accountId) {
      where.accountId = accountId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = startDate;
      }
      if (endDate) {
        where.transactionDate.lte = endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.accountTransaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { transactionDate: "desc" },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              accountNumber: true,
            },
          },
          createdBy: true,
          salePayment: {
            include: {
              sale: true,
            },
          },
          receivablePayment: {
            include: {
              receivable: true,
            },
          },
          expense: true,
          relatedAccount: {
            select: {
              id: true,
              name: true,
              type: true,
              accountNumber: true,
            },
          },
        },
      }),
      prisma.accountTransaction.count({ where }),
    ]);

    const serializedTransactions = transactions.map(serializeTransaction);

    return {
      success: true,
      data: { transactions: serializedTransactions, total },
    };
  } catch (error) {
    console.error("Error fetching account transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getAccountTransaction = async (
  id: string,
): Promise<ActionResponse<AccountTransactionWithRelations>> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    await requireAuth();

    const transaction = await prisma.accountTransaction.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            accountNumber: true,
          },
        },
        createdBy: true,
        salePayment: true,
        receivablePayment: true,
        expense: true,
        relatedAccount: {
          select: {
            id: true,
            name: true,
            type: true,
            accountNumber: true,
          },
        },
      },
    });

    if (!transaction) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error fetching account transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createAccountTransaction = async (
  input: CreateTransactionInput,
): Promise<ActionResponse<AccountTransactionWithRelations>> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    const session = await requireAuth();
    const validated = createTransactionSchema.parse(input);

    const account = await prisma.financialAccount.findUnique({
      where: { id: validated.accountId },
    });

    if (!account) {
      return { success: false, error: t("accountNotFound") };
    }

    const transaction = await prisma.accountTransaction.create({
      data: {
        accountId: validated.accountId,
        type: validated.type,
        amount: new Decimal(validated.amount),
        description: validated.description || null,
        reference: validated.reference || null,
        transactionDate: validated.transactionDate,
        createdById: session.user.id,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            accountNumber: true,
          },
        },
        createdBy: true,
      },
    });

    revalidatePath("/accounts");

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error creating account transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const createAccountTransfer = async (
  input: CreateTransferInput,
): Promise<
  ActionResponse<{
    from: AccountTransactionWithRelations;
    to: AccountTransactionWithRelations;
  }>
> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    const session = await requireAuth();
    const validated = createTransferSchema.parse(input);

    const [fromAccount, toAccount] = await Promise.all([
      prisma.financialAccount.findUnique({
        where: { id: validated.fromAccountId },
      }),
      prisma.financialAccount.findUnique({
        where: { id: validated.toAccountId },
      }),
    ]);

    if (!fromAccount) {
      return { success: false, error: t("sourceAccountNotFound") };
    }

    if (!toAccount) {
      return { success: false, error: t("destinationAccountNotFound") };
    }

    const result = await prisma.$transaction(async (tx) => {
      const outTransaction = await tx.accountTransaction.create({
        data: {
          accountId: validated.fromAccountId,
          type: AccountTransactionType.TRANSFER_OUT,
          amount: new Decimal(validated.amount).negated(),
          description:
            validated.description || `Transferencia a ${toAccount.name}`,
          reference: validated.reference || null,
          transactionDate: validated.transactionDate,
          relatedAccountId: validated.toAccountId,
          createdById: session.user.id,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              accountNumber: true,
            },
          },
          createdBy: true,
          relatedAccount: {
            select: {
              id: true,
              name: true,
              type: true,
              accountNumber: true,
            },
          },
        },
      });

      const inTransaction = await tx.accountTransaction.create({
        data: {
          accountId: validated.toAccountId,
          type: AccountTransactionType.TRANSFER_IN,
          amount: new Decimal(validated.amount),
          description:
            validated.description ||
            `Transferencia desde ${fromAccount.name}`,
          reference: validated.reference || null,
          transactionDate: validated.transactionDate,
          relatedAccountId: validated.fromAccountId,
          transferPairId: outTransaction.id,
          createdById: session.user.id,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              accountNumber: true,
            },
          },
          createdBy: true,
          relatedAccount: {
            select: {
              id: true,
              name: true,
              type: true,
              accountNumber: true,
            },
          },
        },
      });

      return { outTransaction, inTransaction };
    });

    revalidatePath("/accounts");

    return {
      success: true,
      data: {
        from: serializeTransaction(result.outTransaction),
        to: serializeTransaction(result.inTransaction),
      },
    };
  } catch (error) {
    console.error("Error creating account transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateAccountTransaction = async (
  input: UpdateTransactionInput,
): Promise<ActionResponse<AccountTransactionWithRelations>> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    await requireAuth();
    const validated = updateTransactionSchema.parse(input);

    const existing = await prisma.accountTransaction.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    if (
      existing.type === AccountTransactionType.TRANSFER_IN ||
      existing.type === AccountTransactionType.TRANSFER_OUT
    ) {
      return { success: false, error: t("cannotEditTransfer") };
    }

    if (
      existing.salePaymentId ||
      existing.receivablePaymentId ||
      existing.expenseId
    ) {
      return { success: false, error: t("cannotEditLinked") };
    }

    const transaction = await prisma.accountTransaction.update({
      where: { id: validated.id },
      data: {
        type: validated.type,
        amount: new Decimal(validated.amount),
        description: validated.description || null,
        reference: validated.reference || null,
        transactionDate: validated.transactionDate,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            accountNumber: true,
          },
        },
        createdBy: true,
      },
    });

    revalidatePath("/accounts");

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error updating account transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteAccountTransaction = async (
  id: string,
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    await requireAuth();

    const transaction = await prisma.accountTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return { success: false, error: t("notFound") };
    }

    if (
      transaction.type === AccountTransactionType.TRANSFER_IN ||
      transaction.type === AccountTransactionType.TRANSFER_OUT
    ) {
      return { success: false, error: t("cannotDeleteTransfer") };
    }

    if (
      transaction.salePaymentId ||
      transaction.receivablePaymentId ||
      transaction.expenseId
    ) {
      return { success: false, error: t("cannotDeleteLinked") };
    }

    await prisma.accountTransaction.delete({
      where: { id },
    });

    revalidatePath("/accounts");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting account transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

export const getAccountsWithBalance = async (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{
    accounts: AccountWithBalance[];
    total: number;
    totalBalance: number;
  }>
> => {
  const t = await getTranslations("AccountTransactions.errors");

  try {
    await requireAuth();

    const { search = "", limit = 50, offset = 0 } = params || {};

    const where: any = { active: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        {
          accountNumber: { contains: search, mode: "insensitive" as const },
        },
        { institution: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [accounts, total, globalBalanceResult] = await Promise.all([
      prisma.financialAccount.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              transactions: true,
              salePayments: true,
              receivablePayments: true,
              purchases: true,
            },
          },
        },
      }),
      prisma.financialAccount.count({ where }),
      prisma.accountTransaction.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const totalBalance = globalBalanceResult._sum.amount
      ? parseFloat(globalBalanceResult._sum.amount.toString())
      : 0;

    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const result = await prisma.accountTransaction.aggregate({
          where: { accountId: account.id },
          _sum: {
            amount: true,
          },
        });

        const transactionsTotal = result._sum.amount
          ? parseFloat(result._sum.amount.toString())
          : 0;

        const initialBalance = account.initialBalance
          ? parseFloat(account.initialBalance.toString())
          : 0;

        const currentBalance = initialBalance + transactionsTotal;

        return {
          ...account,
          initialBalance: account.initialBalance?.toString?.() ?? "0",
          currentBalance,
          transactionCount: account._count.transactions,
        };
      }),
    );

    return {
      success: true,
      data: {
        accounts: accountsWithBalance as any,
        total,
        totalBalance,
      },
    };
  } catch (error) {
    console.error("Error fetching accounts with balance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};
