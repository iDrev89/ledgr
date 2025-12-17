"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createStockMovementSchema,
  type CreateStockMovementInput,
} from "@/lib/validations/inventory";
import type { StockMovement, Product } from "@/prisma/prisma-client";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Serialize Decimal fields to strings for client components
const serializeStockMovement = (movement: any): any => {
  return {
    ...movement,
    unitCost: movement.unitCost ? movement.unitCost.toString() : null,
    product: movement.product
      ? {
          ...movement.product,
          price: movement.product.price.toString(),
          cost: movement.product.cost ? movement.product.cost.toString() : null,
        }
      : undefined,
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

export const getStockMovements = async (params?: {
  productId?: string;
  moveType?: StockMoveType;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{
    movements: (StockMovement & { product: Product })[];
    total: number;
  }>
> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const { productId, moveType, limit = 50, offset = 0 } = params || {};

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (moveType) {
      where.moveType = moveType;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          product: true,
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    // Serialize Decimal fields to strings
    const serializedMovements = movements.map(serializeStockMovement);

    return { success: true, data: { movements: serializedMovements, total } };
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getStockMovement = async (
  id: string,
): Promise<ActionResponse<StockMovement & { product: Product }>> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!movement) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeStockMovement(movement) };
  } catch (error) {
    console.error("Error fetching stock movement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createStockMovement = async (
  input: CreateStockMovementInput,
): Promise<ActionResponse<StockMovement>> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const validated = createStockMovementSchema.parse(input);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return { success: false, error: t("productNotFound") };
    }

    // Create stock movement
    const movement = await prisma.stockMovement.create({
      data: {
        productId: validated.productId,
        moveType: validated.moveType,
        quantity: validated.quantity,
        unitCost: validated.unitCost ? new Decimal(validated.unitCost) : null,
        note: validated.note || null,
      },
    });

    revalidatePath("/inventory");

    return { success: true, data: serializeStockMovement(movement) };
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const getProductStock = async (
  productId: string,
): Promise<ActionResponse<{ currentStock: number; movements: any[] }>> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch related Purchase and Sale data
    const enrichedMovements = await Promise.all(
      movements.map(async (movement) => {
        let refData = null;

        if (movement.refType === "Purchase" && movement.refId) {
          const purchase = await prisma.purchase.findUnique({
            where: { id: movement.refId },
            select: { purchaseNumber: true },
          });
          refData = purchase;
        } else if (movement.refType === "Sale" && movement.refId) {
          const sale = await prisma.sale.findUnique({
            where: { id: movement.refId },
            select: { saleNumber: true },
          });
          refData = sale;
        }

        return {
          ...movement,
          refData,
        };
      }),
    );

    // Calculate current stock based on movements
    let currentStock = 0;
    movements.forEach((movement) => {
      if (
        movement.moveType === StockMoveType.PURCHASE ||
        movement.moveType === StockMoveType.ADJUSTMENT
      ) {
        if (movement.quantity > 0) {
          currentStock += movement.quantity;
        } else {
          currentStock += movement.quantity; // ADJUSTMENT can be negative
        }
      } else if (movement.moveType === StockMoveType.SALE) {
        currentStock -= Math.abs(movement.quantity);
      }
    });

    const serializedMovements = enrichedMovements.map((movement) => ({
      ...serializeStockMovement(movement),
      refData: movement.refData,
    }));

    return {
      success: true,
      data: { currentStock, movements: serializedMovements },
    };
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getInventorySummary = async (): Promise<
  ActionResponse<
    {
      product: Product;
      currentStock: number;
      lastMovement?: StockMovement;
    }[]
  >
> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    // Get all products
    const products = await prisma.product.findMany({
      where: { active: true, type: "PRODUCT" }, // Only physical products
      orderBy: { name: "asc" },
    });

    // Get stock for each product
    const inventorySummary = await Promise.all(
      products.map(async (product) => {
        const movements = await prisma.stockMovement.findMany({
          where: { productId: product.id },
          orderBy: { createdAt: "desc" },
        });

        let currentStock = 0;
        movements.forEach((movement) => {
          if (
            movement.moveType === StockMoveType.PURCHASE ||
            movement.moveType === StockMoveType.ADJUSTMENT
          ) {
            currentStock += movement.quantity;
          } else if (movement.moveType === StockMoveType.SALE) {
            currentStock -= Math.abs(movement.quantity);
          }
        });

        return {
          product: {
            ...product,
            price: product.price.toString() as any,
            cost: product.cost ? (product.cost.toString() as any) : null,
          },
          currentStock,
          lastMovement: movements[0]
            ? serializeStockMovement(movements[0])
            : undefined,
        };
      }),
    );

    return { success: true, data: inventorySummary };
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};
