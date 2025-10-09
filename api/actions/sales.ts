"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createSaleSchema,
  updateSaleSchema,
  type CreateSaleInput,
  type UpdateSaleInput,
} from "@/lib/validations/sales";
import type { Sale, SaleItem, Customer, Product } from "@/prisma/prisma-client";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type SaleWithDetails = Sale & {
  customer: Customer;
  items: (SaleItem & {
    product: Product;
  })[];
};

// Serialize Decimal fields to strings for client components
const serializeSale = (sale: any): any => {
  return {
    ...sale,
    subtotal: sale.subtotal.toString(),
    discountTotal: sale.discountTotal.toString(),
    taxTotal: sale.taxTotal.toString(),
    total: sale.total.toString(),
    customer: sale.customer
      ? {
          ...sale.customer,
        }
      : undefined,
    items: sale.items
      ? sale.items.map((item: any) => ({
          ...item,
          unitPrice: item.unitPrice.toString(),
          discount: item.discount.toString(),
          lineTotal: item.lineTotal.toString(),
          product: item.product
            ? {
                ...item.product,
                price: item.product.price.toString(),
                cost: item.product.cost
                  ? item.product.cost.toString()
                  : null,
              }
            : undefined,
        }))
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

export const getSales = async (params?: {
  search?: string;
  customerId?: string;
  paymentMethod?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ sales: SaleWithDetails[]; total: number }>> => {
  const t = await getTranslations("Sales.errors");

  try {
    await requireAuth();

    const {
      search = "",
      customerId,
      paymentMethod,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: "insensitive" as const } } },
        { customer: { email: { contains: search, mode: "insensitive" as const } } },
        { note: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    const serializedSales = sales.map(serializeSale);

    return { success: true, data: { sales: serializedSales, total } };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getSale = async (
  id: string
): Promise<ActionResponse<SaleWithDetails>> => {
  const t = await getTranslations("Sales.errors");

  try {
    await requireAuth();

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeSale(sale) };
  } catch (error) {
    console.error("Error fetching sale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createSale = async (
  input: CreateSaleInput
): Promise<ActionResponse<SaleWithDetails>> => {
  const t = await getTranslations("Sales.errors");

  try {
    const session = await requireAuth();

    const validated = createSaleSchema.parse(input);

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: validated.customerId },
    });

    if (!customer) {
      return { success: false, error: t("customerNotFound") };
    }

    // Verify all products exist and are active
    const productIds = validated.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return { success: false, error: t("productNotFound") };
    }

    const inactiveProduct = products.find((p) => !p.active);
    if (inactiveProduct) {
      return {
        success: false,
        error: t("productInactive", { name: inactiveProduct.name }),
      };
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    let discountTotal = new Decimal(0);

    const itemsWithTotals = validated.items.map((item) => {
      const unitPrice = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discount);
      const lineTotal = unitPrice
        .times(item.quantity)
        .minus(discount);

      subtotal = subtotal.plus(unitPrice.times(item.quantity));
      discountTotal = discountTotal.plus(discount);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount,
        lineTotal,
      };
    });

    const taxTotal = new Decimal(0); // TODO: Implement tax calculation in future
    const total = subtotal.minus(discountTotal).plus(taxTotal);

    // Create sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          createdById: session.user.id,
          customerId: validated.customerId,
          currency: "COP",
          subtotal,
          discountTotal,
          taxTotal,
          total,
          paymentMethod: validated.paymentMethod,
          note: validated.note || null,
          items: {
            create: itemsWithTotals,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create stock movements for each item (if product type is PRODUCT)
      for (const item of itemsWithTotals) {
        const product = products.find((p) => p.id === item.productId);
        if (product?.type === "PRODUCT") {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              moveType: StockMoveType.SALE,
              quantity: item.quantity,
              unitCost: product.cost,
              note: `Venta #${String(newSale.saleNumber).padStart(4, "0")}`,
            },
          });
        }
      }

      return newSale;
    });

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { success: true, data: serializeSale(sale) };
  } catch (error) {
    console.error("Error creating sale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateSale = async (
  input: UpdateSaleInput
): Promise<ActionResponse<SaleWithDetails>> => {
  const t = await getTranslations("Sales.errors");

  try {
    await requireAuth();

    const validated = updateSaleSchema.parse(input);

    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id: validated.id },
      include: { items: true },
    });

    if (!existingSale) {
      return { success: false, error: t("notFound") };
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: validated.customerId },
    });

    if (!customer) {
      return { success: false, error: t("customerNotFound") };
    }

    // Verify all products exist and are active
    const productIds = validated.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return { success: false, error: t("productNotFound") };
    }

    const inactiveProduct = products.find((p) => !p.active);
    if (inactiveProduct) {
      return {
        success: false,
        error: t("productInactive", { name: inactiveProduct.name }),
      };
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    let discountTotal = new Decimal(0);

    const itemsWithTotals = validated.items.map((item) => {
      const unitPrice = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discount);
      const lineTotal = unitPrice
        .times(item.quantity)
        .minus(discount);

      subtotal = subtotal.plus(unitPrice.times(item.quantity));
      discountTotal = discountTotal.plus(discount);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount,
        lineTotal,
      };
    });

    const taxTotal = new Decimal(0);
    const total = subtotal.minus(discountTotal).plus(taxTotal);

    // Update sale in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Get the current sale to know its saleNumber
      const currentSale = await tx.sale.findUnique({
        where: { id: validated.id },
        select: { saleNumber: true },
      });

      // Delete old items and stock movements
      await tx.saleItem.deleteMany({
        where: { saleId: validated.id },
      });

      if (currentSale) {
        await tx.stockMovement.deleteMany({
          where: {
            moveType: StockMoveType.SALE,
            note: { contains: `Venta #${String(currentSale.saleNumber).padStart(4, "0")}` },
          },
        });
      }

      // Update the sale with new items
      const updatedSale = await tx.sale.update({
        where: { id: validated.id },
        data: {
          customerId: validated.customerId,
          subtotal,
          discountTotal,
          taxTotal,
          total,
          paymentMethod: validated.paymentMethod,
          note: validated.note || null,
          items: {
            create: itemsWithTotals,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create new stock movements
      for (const item of itemsWithTotals) {
        const product = products.find((p) => p.id === item.productId);
        if (product?.type === "PRODUCT") {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              moveType: StockMoveType.SALE,
              quantity: item.quantity,
              unitCost: product.cost,
              note: `Venta #${String(updatedSale.saleNumber).padStart(4, "0")}`,
            },
          });
        }
      }

      return updatedSale;
    });

    revalidatePath("/sales");
    revalidatePath(`/sales/${sale.id}`);
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { success: true, data: serializeSale(sale) };
  } catch (error) {
    console.error("Error updating sale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteSale = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Sales.errors");

  try {
    await requireAuth();

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        receivables: true,
      },
    });

    if (!sale) {
      return { success: false, error: t("notFound") };
    }

    if (sale.receivables.length > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    // Delete sale and related stock movements in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({
        where: {
          moveType: StockMoveType.SALE,
          note: { contains: `Venta #${String(sale.saleNumber).padStart(4, "0")}` },
        },
      });

      await tx.sale.delete({
        where: { id },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting sale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

