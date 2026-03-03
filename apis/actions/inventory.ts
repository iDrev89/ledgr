"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createStockMovementSchema,
  stockTransferSchema,
  type CreateStockMovementInput,
  type StockTransferInput,
} from "@/lib/validations/inventory";
import type { StockMovement, Product } from "@/prisma/prisma-client";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

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

const calculateStock = (
  movements: { moveType: StockMoveType; quantity: number }[],
): number => {
  let stock = 0;
  movements.forEach((m) => {
    if (m.moveType === StockMoveType.SALE) {
      stock -= Math.abs(m.quantity);
    } else {
      stock += m.quantity;
    }
  });
  return stock;
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
  branchId?: string;
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

    const { productId, branchId, moveType, limit = 50, offset = 0 } = params || {};

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (branchId) {
      where.branchId = branchId;
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
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

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
        branch: { select: { id: true, name: true } },
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

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return { success: false, error: t("productNotFound") };
    }

    const movement = await prisma.stockMovement.create({
      data: {
        productId: validated.productId,
        branchId: validated.branchId || null,
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
  branchId?: string,
): Promise<ActionResponse<{ currentStock: number; movements: any[] }>> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const movementWhere: any = { productId };
    if (branchId) {
      movementWhere.branchId = branchId;
    }

    const movements = await prisma.stockMovement.findMany({
      where: movementWhere,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { id: true, name: true } },
      },
    });

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

        return { ...movement, refData };
      }),
    );

    const currentStock = calculateStock(movements);

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

export const getInventorySummary = async (params?: {
  search?: string;
  branchId?: string;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{
    items: {
      product: Product;
      currentStock: number;
      lastMovement?: StockMovement;
    }[];
    total: number;
    stats: {
      totalProducts: number;
      lowStock: number;
      outOfStock: number;
      inStock: number;
    };
  }>
> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const { search = "", branchId, limit, offset = 0 } = params || {};

    const where: any = { active: true, type: "PRODUCT" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const stockMoveWhere: any = {};
    if (branchId) {
      stockMoveWhere.branchId = branchId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        ...(limit ? { take: limit } : {}),
        skip: offset,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    const allProductsForStats = await prisma.product.findMany({
      where: { active: true, type: "PRODUCT" },
      select: {
        id: true,
        stockMoves: {
          where: stockMoveWhere,
          select: { moveType: true, quantity: true },
        },
      },
    });

    const stats = {
      totalProducts: allProductsForStats.length,
      lowStock: 0,
      outOfStock: 0,
      inStock: 0,
    };

    allProductsForStats.forEach((p) => {
      const currentStock = calculateStock(p.stockMoves);
      if (currentStock === 0) stats.outOfStock++;
      else if (currentStock <= 10) stats.lowStock++;
      else stats.inStock++;
    });

    const inventorySummary = await Promise.all(
      products.map(async (product) => {
        const movements = await prisma.stockMovement.findMany({
          where: { productId: product.id, ...stockMoveWhere },
          orderBy: { createdAt: "desc" },
        });

        const currentStock = calculateStock(movements);

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

    return {
      success: true,
      data: { items: inventorySummary, total, stats },
    };
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const transferStock = async (
  input: StockTransferInput,
): Promise<ActionResponse<{ fromMovement: StockMovement; toMovement: StockMovement }>> => {
  const t = await getTranslations("Inventory.errors");

  try {
    await requireAuth();

    const validated = stockTransferSchema.parse(input);

    if (validated.fromBranchId === validated.toBranchId) {
      return { success: false, error: t("sameBranch") };
    }

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return { success: false, error: t("productNotFound") };
    }

    const originMovements = await prisma.stockMovement.findMany({
      where: { productId: validated.productId, branchId: validated.fromBranchId },
      select: { moveType: true, quantity: true },
    });

    const originStock = calculateStock(originMovements);

    if (originStock < validated.quantity) {
      return { success: false, error: t("insufficientStock") };
    }

    const refId = `transfer-${Date.now()}`;

    const [fromMovement, toMovement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: validated.productId,
          branchId: validated.fromBranchId,
          moveType: StockMoveType.TRANSFER,
          quantity: -validated.quantity,
          refType: "Transfer",
          refId,
          note: validated.note || null,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: validated.productId,
          branchId: validated.toBranchId,
          moveType: StockMoveType.TRANSFER,
          quantity: validated.quantity,
          refType: "Transfer",
          refId,
          note: validated.note || null,
        },
      }),
    ]);

    revalidatePath("/inventory");

    return {
      success: true,
      data: {
        fromMovement: serializeStockMovement(fromMovement),
        toMovement: serializeStockMovement(toMovement),
      },
    };
  } catch (error) {
    console.error("Error transferring stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("transferFailed"),
    };
  }
};
