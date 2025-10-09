"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType } from "@/prisma/prisma-client";

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

// Get dashboard statistics
export const getDashboardStats = async (): Promise<
  ActionResponse<{
    totalSales: string;
    salesCount: number;
    totalExpenses: string;
    customerCount: number;
    salesGrowth: number;
    expensesGrowth: number;
  }>
> => {
  const t = await getTranslations("Dashboard.errors");

  try {
    await requireAuth();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month sales
    const [salesThisMonth, salesLastMonth] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          total: true,
        },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    // Current month expenses
    const [expensesThisMonth, expensesLastMonth] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          incurredAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.expense.aggregate({
        where: {
          incurredAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Total customers
    const customerCount = await prisma.customer.count();

    // Calculate growth percentages
    const totalSales = salesThisMonth._sum.total || new Decimal(0);
    const lastMonthSales = salesLastMonth._sum.total || new Decimal(0);
    const salesGrowth =
      lastMonthSales.toNumber() > 0
        ? ((totalSales.toNumber() - lastMonthSales.toNumber()) /
            lastMonthSales.toNumber()) *
          100
        : 0;

    const totalExpenses = expensesThisMonth._sum.amount || new Decimal(0);
    const lastMonthExpenses = expensesLastMonth._sum.amount || new Decimal(0);
    const expensesGrowth =
      lastMonthExpenses.toNumber() > 0
        ? ((totalExpenses.toNumber() - lastMonthExpenses.toNumber()) /
            lastMonthExpenses.toNumber()) *
          100
        : 0;

    return {
      success: true,
      data: {
        totalSales: totalSales.toString(),
        salesCount: salesThisMonth._count,
        totalExpenses: totalExpenses.toString(),
        customerCount,
        salesGrowth: Math.round(salesGrowth * 10) / 10,
        expensesGrowth: Math.round(expensesGrowth * 10) / 10,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

// Get sales chart data (last 7 days)
export const getSalesChartData = async (): Promise<
  ActionResponse<
    Array<{
      date: string;
      sales: number;
      expenses: number;
    }>
  >
> => {
  const t = await getTranslations("Dashboard.errors");

  try {
    await requireAuth();

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: last7Days,
          },
        },
        select: {
          createdAt: true,
          total: true,
        },
      }),
      prisma.expense.findMany({
        where: {
          incurredAt: {
            gte: last7Days,
          },
        },
        select: {
          incurredAt: true,
          amount: true,
        },
      }),
    ]);

    // Group by date
    const dataMap = new Map<string, { sales: number; expenses: number }>();

    // Initialize all dates
    for (let i = 0; i < 7; i++) {
      const date = new Date(last7Days);
      date.setDate(last7Days.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dataMap.set(dateStr, { sales: 0, expenses: 0 });
    }

    // Add sales
    sales.forEach((sale) => {
      const dateStr = sale.createdAt.toISOString().split("T")[0];
      const current = dataMap.get(dateStr);
      if (current) {
        current.sales += sale.total.toNumber();
      }
    });

    // Add expenses
    expenses.forEach((expense) => {
      const dateStr = expense.incurredAt.toISOString().split("T")[0];
      const current = dataMap.get(dateStr);
      if (current) {
        current.expenses += expense.amount.toNumber();
      }
    });

    const chartData = Array.from(dataMap.entries()).map(([date, data]) => ({
      date,
      sales: Math.round(data.sales),
      expenses: Math.round(data.expenses),
    }));

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

// Get top selling products
export const getTopProducts = async (): Promise<
  ActionResponse<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: string;
    }>
  >
> => {
  const t = await getTranslations("Dashboard.errors");

  try {
    await requireAuth();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topProducts = await prisma.saleItem.groupBy({
      by: ["productId"],
      where: {
        sale: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      },
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const productsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });

        return {
          productId: item.productId,
          productName: product?.name || "Unknown",
          quantity: item._sum.quantity || 0,
          revenue: (item._sum.lineTotal || new Decimal(0)).toString(),
        };
      })
    );

    return { success: true, data: productsWithNames };
  } catch (error) {
    console.error("Error fetching top products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (): Promise<
  ActionResponse<
    Array<{
      productId: string;
      productName: string;
      currentStock: number;
    }>
  >
> => {
  const t = await getTranslations("Dashboard.errors");

  try {
    await requireAuth();

    const products = await prisma.product.findMany({
      where: {
        active: true,
        type: "PRODUCT",
      },
      select: {
        id: true,
        name: true,
      },
    });

    const lowStockProducts = [];

    for (const product of products) {
      const movements = await prisma.stockMovement.findMany({
        where: { productId: product.id },
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

      if (currentStock <= 10 && currentStock >= 0) {
        lowStockProducts.push({
          productId: product.id,
          productName: product.name,
          currentStock,
        });
      }
    }

    return {
      success: true,
      data: lowStockProducts.sort((a, b) => a.currentStock - b.currentStock).slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

