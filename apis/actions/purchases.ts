"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType, AccountTransactionType } from "@/prisma/prisma-client";
import type {
  PurchaseWithDetails,
  SerializedPurchase,
  CreatePurchaseInput,
} from "@/lib/types/purchases";
import { createPurchaseSchema } from "@/lib/validations/purchases";
import { resolveUserBranchId } from "@/lib/server-auth";

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

const serializePurchase = (
  purchase: PurchaseWithDetails,
): SerializedPurchase => {
  return {
    id: purchase.id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplierId,
    supplier: purchase.supplier,
    currency: purchase.currency,
    invoiceNo: purchase.invoiceNo,
    status: purchase.status,
    note: purchase.note,

    paymentMethod: purchase.paymentMethod,
    accountId: purchase.accountId,
    account: purchase.account,
    reference: purchase.reference,

    subtotal: purchase.subtotal.toString(),
    taxTotal: purchase.taxTotal.toString(),
    total: purchase.total.toString(),
    createdById: purchase.createdById,
    createdBy: purchase.createdBy,
    createdAt: purchase.createdAt.toISOString(),
    updatedAt: purchase.updatedAt.toISOString(),
    items: purchase.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      unitCost: item.unitCost.toString(),
      lineTotal: item.lineTotal.toString(),
    })),
  };
};

export async function getPurchases(params?: {
  search?: string;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{ purchases: SerializedPurchase[]; total: number }>
> {
  try {
    await requireAuth();

    const {
      search = "",
      supplierId,
      dateFrom,
      dateTo,
      limit,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { purchaseNumber: { contains: search, mode: "insensitive" as const } },
        { invoiceNo: { contains: search, mode: "insensitive" as const } },
        { note: { contains: search, mode: "insensitive" as const } },
        {
          supplier: {
            name: { contains: search, mode: "insensitive" as const },
          },
        },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        ...(limit ? { take: limit } : {}),
        skip: offset,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    const serialized = purchases.map(serializePurchase);

    return {
      success: true,
      data: {
        purchases: serialized,
        total: purchases.length,
      },
    };
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al cargar compras",
    };
  }
}

export async function getPurchaseById(
  id: string,
): Promise<ActionResponse<SerializedPurchase>> {
  try {
    await requireAuth();

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      return {
        success: false,
        error: "Compra no encontrada",
      };
    }

    return {
      success: true,
      data: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al cargar compra",
    };
  }
}

export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<ActionResponse<SerializedPurchase>> {
  try {
    const session = await requireAuth();

    const validated = createPurchaseSchema.parse(input);

    const subtotal = validated.items.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );
    const taxTotal = validated.taxTotal || 0;
    const total = subtotal + taxTotal;

    const branchId = await resolveUserBranchId(session.user.id, validated.branchId);

    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          supplierId: validated.supplierId || null,
          branchId,
          currency: "COP",
          invoiceNo: validated.invoiceNo || null,
          status: "APPROVED",
          note: validated.note || null,

          paymentMethod: validated.paymentMethod,
          accountId: validated.accountId,
          reference: validated.reference || null,

          subtotal: new Decimal(subtotal),
          taxTotal: new Decimal(taxTotal),
          total: new Decimal(total),
          createdById: session.user.id,
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: new Decimal(item.unitCost),
              lineTotal: new Decimal(item.lineTotal),
            })),
          },
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      for (const item of validated.items) {
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            branchId: newPurchase.branchId || null,
            moveType: StockMoveType.PURCHASE,
            quantity: item.quantity,
            unitCost: new Decimal(item.unitCost),
            refType: "Purchase",
            refId: newPurchase.id,
            note: `Compra #${newPurchase.purchaseNumber}${validated.invoiceNo ? ` - ${validated.invoiceNo}` : ""}`,
          },
        });
      }

      await tx.accountTransaction.create({
        data: {
          accountId: validated.accountId,
          type: AccountTransactionType.EXPENSE,
          amount: new Decimal(total).negated(),
          description: `Compra #${newPurchase.purchaseNumber}${validated.invoiceNo ? ` - ${validated.invoiceNo}` : ""}`,
          reference: validated.reference || null,
          transactionDate: new Date(),
          purchaseId: newPurchase.id,
          createdById: session.user.id,
        },
      });

      return newPurchase;
    });

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/reports");

    return {
      success: true,
      data: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear compra",
    };
  }
}

export async function deletePurchase(
  id: string,
): Promise<ActionResponse<void>> {
  try {
    await requireAuth();

    await prisma.$transaction(async (tx) => {
      await tx.accountTransaction.deleteMany({
        where: { purchaseId: id },
      });

      await tx.stockMovement.deleteMany({
        where: {
          refId: id,
          moveType: StockMoveType.PURCHASE,
        },
      });

      await tx.purchase.delete({
        where: { id },
      });
    });

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/reports");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar compra",
    };
  }
}
