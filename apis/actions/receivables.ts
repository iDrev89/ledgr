"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createReceivablePaymentSchema,
  type CreateReceivablePaymentInput,
} from "@/lib/validations/receivables";
import { Decimal } from "@prisma/client/runtime/library";
import { AccountsReceivableStatus } from "@/prisma/prisma-client";

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
const serializeReceivable = (receivable: any): any => {
  return {
    ...receivable,
    total: receivable.total.toString(),
    balance: receivable.balance.toString(),
    sale: receivable.sale
      ? {
          ...receivable.sale,
          total: receivable.sale.total.toString(),
        }
      : null,
    payments: receivable.payments
      ? receivable.payments.map((payment: any) => ({
          ...payment,
          amount: payment.amount.toString(),
          bank: payment.bank || null,
        }))
      : [],
  };
};

export const getReceivables = async (params?: {
  search?: string;
  status?: string;
  customerId?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ receivables: any[]; total: number }>> => {
  const t = await getTranslations("Receivables.errors");

  try {
    await requireAuth();

    const {
      search = "",
      status,
      customerId,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [receivables, total] = await Promise.all([
      prisma.accountsReceivable.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          sale: {
            select: {
              id: true,
              saleNumber: true,
              createdAt: true,
              total: true,
            },
          },
          payments: {
            include: {
              bank: true,
            },
            orderBy: {
              paidAt: "desc",
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      }),
      prisma.accountsReceivable.count({ where }),
    ]);

    const serializedReceivables = receivables.map(serializeReceivable);

    return { success: true, data: { receivables: serializedReceivables, total } };
  } catch (error) {
    console.error("Error fetching receivables:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getReceivable = async (
  id: string
): Promise<ActionResponse<any>> => {
  const t = await getTranslations("Receivables.errors");

  try {
    await requireAuth();

    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id },
      include: {
        customer: true,
        sale: {
          select: {
            id: true,
            saleNumber: true,
            createdAt: true,
            total: true,
          },
        },
        payments: {
          include: {
            bank: true,
          },
          orderBy: {
            paidAt: "desc",
          },
        },
      },
    });

    if (!receivable) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeReceivable(receivable) };
  } catch (error) {
    console.error("Error fetching receivable:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createReceivablePayment = async (
  input: CreateReceivablePaymentInput
): Promise<ActionResponse<any>> => {
  const t = await getTranslations("Receivables.errors");

  try {
    await requireAuth();

    const validated = createReceivablePaymentSchema.parse(input);

    // Get the receivable
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: validated.receivableId },
    });

    if (!receivable) {
      return { success: false, error: t("notFound") };
    }

    if (receivable.status === AccountsReceivableStatus.PAID) {
      return { success: false, error: t("alreadyPaid") };
    }

    if (receivable.status === AccountsReceivableStatus.CANCELED) {
      return { success: false, error: t("canceled") };
    }

    const paymentAmount = new Decimal(validated.amount);

    // Validate payment doesn't exceed balance
    if (paymentAmount.gt(receivable.balance)) {
      return { success: false, error: t("paymentExceedsBalance") };
    }

    // Create payment and update receivable in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.accountsReceivablePayment.create({
        data: {
          receivableId: validated.receivableId,
          amount: paymentAmount,
          method: validated.method,
          bankId: validated.bankId || null,
          note: validated.note || null,
        },
        include: {
          bank: true,
        },
      });

      // Calculate new balance
      const newBalance = receivable.balance.minus(paymentAmount);

      // Update receivable
      const updatedReceivable = await tx.accountsReceivable.update({
        where: { id: validated.receivableId },
        data: {
          balance: newBalance,
          status: newBalance.lte(0)
            ? AccountsReceivableStatus.PAID
            : AccountsReceivableStatus.PARTIAL,
        },
        include: {
          customer: true,
          sale: {
            select: {
              id: true,
              saleNumber: true,
              createdAt: true,
              total: true,
            },
          },
          payments: {
            include: {
              bank: true,
            },
            orderBy: {
              paidAt: "desc",
            },
          },
        },
      });

      return updatedReceivable;
    });

    revalidatePath("/receivables");
    revalidatePath("/dashboard");

    return { success: true, data: serializeReceivable(result) };
  } catch (error) {
    console.error("Error creating receivable payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createPaymentFailed"),
    };
  }
};

export const cancelReceivable = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Receivables.errors");

  try {
    await requireAuth();

    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!receivable) {
      return { success: false, error: t("notFound") };
    }

    if (receivable.payments.length > 0) {
      return {
        success: false,
        error: t("cannotCancelWithPayments"),
      };
    }

    await prisma.accountsReceivable.update({
      where: { id },
      data: {
        status: AccountsReceivableStatus.CANCELED,
      },
    });

    revalidatePath("/receivables");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error canceling receivable:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("cancelFailed"),
    };
  }
};

