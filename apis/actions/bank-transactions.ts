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
} from "@/lib/validations/bank-transactions";
import type { BankTransactionWithRelations, BankWithBalance } from "@/lib/types/bank-transactions";
import { Decimal } from "@prisma/client/runtime/library";

// Definir el enum localmente
enum BankTransactionType {
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

// Serialize Decimal fields to strings for client components
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
                discountTotal: transaction.salePayment.sale.discountTotal?.toString(),
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
                total: transaction.receivablePayment.receivable.total?.toString(),
                balance: transaction.receivablePayment.receivable.balance?.toString(),
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

export const getBankTransactions = async (params?: {
  bankId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ transactions: BankTransactionWithRelations[]; total: number }>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    await requireAuth();

    const {
      bankId,
      type,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (bankId) {
      where.bankId = bankId;
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
      prisma.bankTransaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { transactionDate: "desc" },
        include: {
          bank: true,
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
          relatedBank: true,
        },
      }),
      prisma.bankTransaction.count({ where }),
    ]);

    const serializedTransactions = transactions.map(serializeTransaction);

    return { success: true, data: { transactions: serializedTransactions, total } };
  } catch (error) {
    console.error("Error fetching bank transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getBankTransaction = async (
  id: string
): Promise<ActionResponse<BankTransactionWithRelations>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    await requireAuth();

    const transaction = await prisma.bankTransaction.findUnique({
      where: { id },
      include: {
        bank: true,
        createdBy: true,
        salePayment: true,
        receivablePayment: true,
        expense: true,
        relatedBank: true,
      },
    });

    if (!transaction) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error fetching bank transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createBankTransaction = async (
  input: CreateTransactionInput
): Promise<ActionResponse<BankTransactionWithRelations>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    const session = await requireAuth();
    const validated = createTransactionSchema.parse(input);

    // Verificar que el banco existe
    const bank = await prisma.bank.findUnique({
      where: { id: validated.bankId },
    });

    if (!bank) {
      return { success: false, error: t("bankNotFound") };
    }

    const transaction = await prisma.bankTransaction.create({
      data: {
        bankId: validated.bankId,
        type: validated.type,
        amount: new Decimal(validated.amount),
        description: validated.description || null,
        reference: validated.reference || null,
        transactionDate: validated.transactionDate,
        createdById: session.user.id,
      },
      include: {
        bank: true,
        createdBy: true,
      },
    });

    revalidatePath("/banks");
    revalidatePath(`/banks/${validated.bankId}`);

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error creating bank transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const createBankTransfer = async (
  input: CreateTransferInput
): Promise<ActionResponse<{ from: BankTransactionWithRelations; to: BankTransactionWithRelations }>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    const session = await requireAuth();
    const validated = createTransferSchema.parse(input);

    // Verificar que ambos bancos existen
    const [fromBank, toBank] = await Promise.all([
      prisma.bank.findUnique({ where: { id: validated.fromBankId } }),
      prisma.bank.findUnique({ where: { id: validated.toBankId } }),
    ]);

    if (!fromBank) {
      return { success: false, error: t("sourceBankNotFound") };
    }

    if (!toBank) {
      return { success: false, error: t("destinationBankNotFound") };
    }

    // Crear las dos transacciones en una transacción de BD
    const result = await prisma.$transaction(async (tx) => {
      // Transacción de salida
      const outTransaction = await tx.bankTransaction.create({
        data: {
          bankId: validated.fromBankId,
          type: BankTransactionType.TRANSFER_OUT,
          amount: new Decimal(validated.amount).negated(),
          description: validated.description || `Transferencia a ${toBank.name}`,
          reference: validated.reference || null,
          transactionDate: validated.transactionDate,
          relatedBankId: validated.toBankId,
          createdById: session.user.id,
        },
        include: {
          bank: true,
          createdBy: true,
          relatedBank: true,
        },
      });

      // Transacción de entrada
      const inTransaction = await tx.bankTransaction.create({
        data: {
          bankId: validated.toBankId,
          type: BankTransactionType.TRANSFER_IN,
          amount: new Decimal(validated.amount),
          description: validated.description || `Transferencia desde ${fromBank.name}`,
          reference: validated.reference || null,
          transactionDate: validated.transactionDate,
          relatedBankId: validated.fromBankId,
          transferPairId: outTransaction.id,
          createdById: session.user.id,
        },
        include: {
          bank: true,
          createdBy: true,
          relatedBank: true,
        },
      });

      return { outTransaction, inTransaction };
    });

    revalidatePath("/banks");
    revalidatePath(`/banks/${validated.fromBankId}`);
    revalidatePath(`/banks/${validated.toBankId}`);

    return {
      success: true,
      data: {
        from: serializeTransaction(result.outTransaction),
        to: serializeTransaction(result.inTransaction),
      },
    };
  } catch (error) {
    console.error("Error creating bank transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateBankTransaction = async (
  input: UpdateTransactionInput
): Promise<ActionResponse<BankTransactionWithRelations>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    await requireAuth();
    const validated = updateTransactionSchema.parse(input);

    const existing = await prisma.bankTransaction.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    // No permitir editar transferencias (tienen pares)
    if (existing.type === BankTransactionType.TRANSFER_IN || 
        existing.type === BankTransactionType.TRANSFER_OUT) {
      return { success: false, error: t("cannotEditTransfer") };
    }

    // No permitir editar transacciones vinculadas a pagos o gastos
    if (existing.salePaymentId || existing.receivablePaymentId || existing.expenseId) {
      return { success: false, error: t("cannotEditLinked") };
    }

    const transaction = await prisma.bankTransaction.update({
      where: { id: validated.id },
      data: {
        type: validated.type,
        amount: new Decimal(validated.amount),
        description: validated.description || null,
        reference: validated.reference || null,
        transactionDate: validated.transactionDate,
      },
      include: {
        bank: true,
        createdBy: true,
      },
    });

    revalidatePath("/banks");
    revalidatePath(`/banks/${transaction.bankId}`);

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error updating bank transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteBankTransaction = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    await requireAuth();

    const transaction = await prisma.bankTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return { success: false, error: t("notFound") };
    }

    // No permitir eliminar transferencias (tienen pares)
    if (transaction.type === BankTransactionType.TRANSFER_IN || 
        transaction.type === BankTransactionType.TRANSFER_OUT) {
      return { success: false, error: t("cannotDeleteTransfer") };
    }

    // No permitir eliminar transacciones vinculadas a pagos o gastos
    if (transaction.salePaymentId || transaction.receivablePaymentId || transaction.expenseId) {
      return { success: false, error: t("cannotDeleteLinked") };
    }

    await prisma.bankTransaction.delete({
      where: { id },
    });

    revalidatePath("/banks");
    revalidatePath(`/banks/${transaction.bankId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting bank transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

export const getBanksWithBalance = async (): Promise<ActionResponse<BankWithBalance[]>> => {
  const t = await getTranslations("BankTransactions.errors");

  try {
    await requireAuth();

    const banks = await prisma.bank.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const banksWithBalance = await Promise.all(
      banks.map(async (bank) => {
        const result = await prisma.bankTransaction.aggregate({
          where: { bankId: bank.id },
          _sum: {
            amount: true,
          },
        });

        const transactionsTotal = result._sum.amount
          ? parseFloat(result._sum.amount.toString())
          : 0;
        
        const currentBalance = transactionsTotal;

        return {
          id: bank.id,
          name: bank.name,
          accountNo: bank.accountNo,
          active: bank.active,
          createdAt: bank.createdAt,
          updatedAt: bank.updatedAt,
          currentBalance,
          transactionCount: bank._count.transactions,
        };
      })
    );

    return { success: true, data: banksWithBalance as any };
  } catch (error) {
    console.error("Error fetching banks with balance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

