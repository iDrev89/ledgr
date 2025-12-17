"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType } from "@/prisma/prisma-client";
import type {
  PurchaseWithDetails,
  SerializedPurchase,
  CreatePurchaseInput,
} from "@/lib/types/purchases";
import { createPurchaseSchema } from "@/lib/validations/purchases";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to check authentication
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

// Helper to serialize purchase
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

    // Campos de pago
    paymentMethod: purchase.paymentMethod,
    bankId: purchase.bankId,
    bank: purchase.bank,
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

/**
 * Get all purchases
 */
export async function getPurchases(): Promise<
  ActionResponse<{ purchases: SerializedPurchase[]; total: number }>
> {
  try {
    const session = await requireAuth();

    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        bank: {
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
    });

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

/**
 * Get purchase by ID
 */
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
        bank: {
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

/**
 * Create new purchase with inventory integration
 */
export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<ActionResponse<SerializedPurchase>> {
  try {
    const session = await requireAuth();

    // Validate input
    const validated = createPurchaseSchema.parse(input);

    // Calculate totals
    const subtotal = validated.items.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );
    const taxTotal = validated.taxTotal || 0;
    const total = subtotal + taxTotal;

    // Create purchase with items in a transaction
    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Create purchase with APPROVED status
      const newPurchase = await tx.purchase.create({
        data: {
          supplierId: validated.supplierId || null,
          currency: "COP",
          invoiceNo: validated.invoiceNo || null,
          status: "APPROVED",
          note: validated.note || null,

          // Campos de pago
          paymentMethod: validated.paymentMethod,
          bankId: validated.bankId || null,
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
          bank: {
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

      // 2. Create stock movements for each item (PURCHASE type)
      for (const item of validated.items) {
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            moveType: StockMoveType.PURCHASE,
            quantity: item.quantity,
            unitCost: new Decimal(item.unitCost),
            refType: "Purchase",
            refId: newPurchase.id,
            note: `Compra #${newPurchase.purchaseNumber}${validated.invoiceNo ? ` - ${validated.invoiceNo}` : ""}`,
          },
        });
      }

      // 3. Create bank transaction if bank is associated and method is TRANSFER
      if (validated.bankId && validated.paymentMethod === "TRANSFER") {
        await tx.bankTransaction.create({
          data: {
            bankId: validated.bankId,
            type: "DEBIT", // Salida de dinero
            amount: new Decimal(total),
            description: `Compra #${newPurchase.purchaseNumber}${validated.invoiceNo ? ` - ${validated.invoiceNo}` : ""}`,
            reference: validated.reference || null,
            transactionDate: new Date(),
            purchaseId: newPurchase.id,
            createdById: session.user.id,
          },
        });
      }

      return newPurchase;
    });

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

/**
 * Delete purchase
 * Note: This will also delete associated stock movements via cascade
 */
export async function deletePurchase(
  id: string,
): Promise<ActionResponse<void>> {
  try {
    await requireAuth();

    await prisma.purchase.delete({
      where: { id },
    });

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
