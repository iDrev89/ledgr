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
import type {
  Sale,
  SaleItem,
  SalePayment,
  Customer,
  Product,
  Bank,
} from "@/prisma/prisma-client";
import { Decimal } from "@prisma/client/runtime/library";
import type { SaleWithDetails } from "@/lib/types/sales";
import {
  StockMoveType,
  AccountsReceivableStatus,
  ProductType,
} from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Serialize Decimal fields to strings for client components
const serializeSale = (sale: any): SaleWithDetails => {
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
    createdBy: sale.createdBy
      ? {
          id: sale.createdBy.id,
          name: sale.createdBy.name,
          email: sale.createdBy.email,
        }
      : undefined,
    items: sale.items
      ? sale.items.map((item: any) => ({
          ...item,
          unitPrice: item.unitPrice.toString(),
          discount: item.discount.toString(),
          lineTotal: item.lineTotal.toString(),
          commissionPercentApplied: item.commissionPercentApplied
            ? item.commissionPercentApplied.toString()
            : null,
          product: item.product
            ? {
                ...item.product,
                price: item.product.price.toString(),
                cost: item.product.cost ? item.product.cost.toString() : null,
                commissionPercent: item.product.commissionPercent
                  ? item.product.commissionPercent.toString()
                  : null,
              }
            : undefined,
          performedBy: item.performedBy
            ? {
                id: item.performedBy.id,
                name: item.performedBy.name,
                email: item.performedBy.email,
              }
            : null,
        }))
      : undefined,
    payments: sale.payments
      ? sale.payments.map((payment: any) => ({
          ...payment,
          amount: payment.amount.toString(),
          bank: payment.bank || null,
          attachmentUrl: payment.attachmentUrl || null,
        }))
      : [],
    receivable: sale.receivable
      ? {
          id: sale.receivable.id,
          total: sale.receivable.total.toString(),
          balance: sale.receivable.balance.toString(),
          status: sale.receivable.status,
        }
      : null,
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
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ sales: SaleWithDetails[]; total: number }>> => {
  const t = await getTranslations("Sales.errors");

  try {
    await requireAuth();

    const { search = "", customerId, limit = 50, offset = 0 } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        {
          customer: {
            name: { contains: search, mode: "insensitive" as const },
          },
        },
        {
          customer: {
            email: { contains: search, mode: "insensitive" as const },
          },
        },
        { note: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
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
              performedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          payments: {
            include: {
              bank: true,
            },
          },
          receivable: {
            select: {
              id: true,
              total: true,
              balance: true,
              status: true,
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
  id: string,
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
            performedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        payments: {
          include: {
            bank: true,
          },
        },
        receivable: {
          select: {
            id: true,
            total: true,
            balance: true,
            status: true,
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
  input: CreateSaleInput,
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

    // Create a map of products for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate totals
    let subtotal = new Decimal(0);
    let discountTotal = new Decimal(0);

    const itemsWithTotals = validated.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(t("productNotFound", { productId: item.productId }));
      }

      const unitPrice = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discount);
      const lineTotal = unitPrice.times(item.quantity).minus(discount);

      subtotal = subtotal.plus(unitPrice.times(item.quantity));
      discountTotal = discountTotal.plus(discount);

      // For services: freeze commission % and assign performer
      if (product.type === ProductType.SERVICE) {
        const commissionPercent = product.commissionPercent || new Decimal(0);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discount,
          lineTotal,
          performedById: item.performedById || session.user.id, // Default to sale creator
          commissionPercentApplied: commissionPercent,
        };
      } else {
        // Products don't have commission or performer
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discount,
          lineTotal,
          performedById: undefined,
          commissionPercentApplied: null,
        };
      }
    });

    const taxTotal = new Decimal(0); // TODO: Implement tax calculation in future
    const total = subtotal.minus(discountTotal).plus(taxTotal);

    // Calculate total paid and validate
    let totalPaid = new Decimal(0);
    const paymentsWithAmounts = validated.payments.map((payment) => {
      const amount = new Decimal(payment.amount);
      totalPaid = totalPaid.plus(amount);
      return {
        amount,
        method: payment.method,
        bankId: payment.bankId || null,
        reference: payment.reference || null,
        attachmentUrl: payment.attachmentUrl || null,
      };
    });

    // Validate that payments don't exceed total
    if (totalPaid.gt(total)) {
      return {
        success: false,
        error: t("paymentsExceedTotal"),
      };
    }

    // Calculate balance for receivable
    const balance = total.minus(totalPaid);

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
          note: validated.note || null,
          items: {
            create: itemsWithTotals,
          },
          payments: {
            create: paymentsWithAmounts,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              performedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          payments: {
            include: {
              bank: true,
            },
          },
        },
      });

      // Create AccountsReceivable if there's a balance
      let receivable = null;
      if (balance.gt(0)) {
        receivable = await tx.accountsReceivable.create({
          data: {
            customerId: validated.customerId,
            saleId: newSale.id,
            currency: "COP",
            total,
            balance,
            status: totalPaid.gt(0)
              ? AccountsReceivableStatus.PARTIAL
              : AccountsReceivableStatus.OPEN,
          },
          select: {
            id: true,
            total: true,
            balance: true,
            status: true,
          },
        });
      }

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

      // Create bank transactions for payments with bank
      for (const payment of newSale.payments) {
        if (payment.bankId) {
          await tx.bankTransaction.create({
            data: {
              bankId: payment.bankId,
              type: "INCOME" as any,
              amount: payment.amount,
              description: `Venta #${String(newSale.saleNumber).padStart(4, "0")}${newSale.customer ? ` - ${newSale.customer.name}` : ""}`,
              reference: payment.reference || null,
              transactionDate: payment.paidAt,
              salePaymentId: payment.id,
              createdById: session.user.id,
            },
          });
        }
      }

      return { ...newSale, receivable };
    });

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/banks");

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
  input: UpdateSaleInput,
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

    // Create a map of products for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate totals
    let subtotal = new Decimal(0);
    let discountTotal = new Decimal(0);

    const itemsWithTotals = validated.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(t("productNotFound", { productId: item.productId }));
      }

      const unitPrice = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discount);
      const lineTotal = unitPrice.times(item.quantity).minus(discount);

      subtotal = subtotal.plus(unitPrice.times(item.quantity));
      discountTotal = discountTotal.plus(discount);

      // For services: freeze commission % and assign performer
      if (product.type === ProductType.SERVICE) {
        const commissionPercent = product.commissionPercent || new Decimal(0);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discount,
          lineTotal,
          performedById: item.performedById, //|| session.user.id, // Default to sale creator
          commissionPercentApplied: commissionPercent,
        };
      } else {
        // Products don't have commission or performer
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discount,
          lineTotal,
          performedById: undefined,
          commissionPercentApplied: null,
        };
      }
    });

    const taxTotal = new Decimal(0);
    const total = subtotal.minus(discountTotal).plus(taxTotal);

    // Calculate total paid and validate
    let totalPaid = new Decimal(0);
    const paymentsWithAmounts = validated.payments.map((payment) => {
      const amount = new Decimal(payment.amount);
      totalPaid = totalPaid.plus(amount);
      return {
        amount,
        method: payment.method,
        bankId: payment.bankId || null,
        reference: payment.reference || null,
        attachmentUrl: payment.attachmentUrl || null,
      };
    });

    // Validate that payments don't exceed total
    if (totalPaid.gt(total)) {
      return {
        success: false,
        error: t("paymentsExceedTotal"),
      };
    }

    // Calculate balance for receivable
    const balance = total.minus(totalPaid);

    // Update sale in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Get the current sale to know its saleNumber
      const currentSale = await tx.sale.findUnique({
        where: { id: validated.id },
        select: { saleNumber: true },
      });

      // Delete old items, payments, stock movements, and receivable
      await tx.saleItem.deleteMany({
        where: { saleId: validated.id },
      });

      await tx.salePayment.deleteMany({
        where: { saleId: validated.id },
      });

      await tx.accountsReceivable.deleteMany({
        where: { saleId: validated.id },
      });

      if (currentSale) {
        await tx.stockMovement.deleteMany({
          where: {
            moveType: StockMoveType.SALE,
            note: {
              contains: `Venta #${String(currentSale.saleNumber).padStart(4, "0")}`,
            },
          },
        });
      }

      // Update the sale with new items and payments
      const updatedSale = await tx.sale.update({
        where: { id: validated.id },
        data: {
          customerId: validated.customerId,
          subtotal,
          discountTotal,
          taxTotal,
          total,
          note: validated.note || null,
          items: {
            create: itemsWithTotals,
          },
          payments: {
            create: paymentsWithAmounts,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              performedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          payments: {
            include: {
              bank: true,
            },
          },
        },
      });

      // Create AccountsReceivable if there's a balance
      let receivable = null;
      if (balance.gt(0)) {
        receivable = await tx.accountsReceivable.create({
          data: {
            customerId: validated.customerId,
            saleId: updatedSale.id,
            currency: "COP",
            total,
            balance,
            status: totalPaid.gt(0)
              ? AccountsReceivableStatus.PARTIAL
              : AccountsReceivableStatus.OPEN,
          },
          select: {
            id: true,
            total: true,
            balance: true,
            status: true,
          },
        });
      }

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

      return { ...updatedSale, receivable };
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

export const deleteSale = async (id: string): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Sales.errors");

  try {
    await requireAuth();

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        receivable: true,
      },
    });

    if (!sale) {
      return { success: false, error: t("notFound") };
    }

    if (sale.receivable) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    // Delete sale and related data in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({
        where: {
          moveType: StockMoveType.SALE,
          note: {
            contains: `Venta #${String(sale.saleNumber).padStart(4, "0")}`,
          },
        },
      });

      await tx.salePayment.deleteMany({
        where: { saleId: id },
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
