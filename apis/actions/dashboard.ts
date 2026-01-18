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

// Get sales chart data (last 7 days including today)
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

    // Get current date and time in UTC
    const now = new Date();

    // Get today at start of day (UTC)
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    // Calculate start date (6 days ago from today)
    const startDate = new Date(today);
    startDate.setUTCDate(today.getUTCDate() - 6);

    // Get tomorrow's date to ensure we include all of today
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: tomorrow, // Less than tomorrow = includes all of today
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
            gte: startDate,
            lt: tomorrow, // Less than tomorrow = includes all of today
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

    // Initialize all 7 dates (from startDate to today, inclusive)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
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

    // Convert to array and ensure it's sorted by date
    const chartData = Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        sales: Math.round(data.sales),
        expenses: Math.round(data.expenses),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

// Get top selling products (only PRODUCT type, not services)
export const getTopProducts = async (): Promise<
  ActionResponse<
    Array<{
      productId: string;
      productName: string;
      productType: string;
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

    // Get all sale items from this month
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: {
            gte: startOfMonth,
          },
        },
        product: {
          type: "PRODUCT", // Only get PRODUCT type, exclude SERVICE
          active: true,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Group and aggregate manually
    const productMap = new Map<
      string,
      { name: string; type: string; quantity: number; revenue: number }
    >();

    saleItems.forEach((item) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.lineTotal.toNumber();
      } else {
        productMap.set(item.productId, {
          name: item.product.name,
          type: item.product.type,
          quantity: item.quantity,
          revenue: item.lineTotal.toNumber(),
        });
      }
    });

    // Convert to array and sort by quantity
    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        productType: data.type,
        quantity: data.quantity,
        revenue: data.revenue.toString(),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { success: true, data: topProducts };
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
      data: lowStockProducts
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

// Get birthdays for TODAY
export const getTodaysBirthdays = async (): Promise<
  ActionResponse<
    Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      age: number;
    }>
  >
> => {
  const t = await getTranslations("Dashboard.errors");

  try {
    await requireAuth();

    const customers = await prisma.customer.findMany({
      where: {
        birthdate: { not: null },
      },
      select: {
        id: true,
        name: true,
        birthdate: true,
        email: true,
        phone: true,
      },
    });

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const todaysBirthdays = customers
      .map((customer) => {
        if (!customer.birthdate) return null;
        const birthdate = new Date(customer.birthdate);

        // Check if month and day match today (ignoring year)
        // Note: birthdate is stored as UTC at midnight usually, so getMonth/getDate works if timezone aligns.
        // Ideally we'd use database functions, but raw query logic is complex across DB types.
        // Javascript Date.getMonth() is 0-indexed.

        // We use getMonth/getDate which operate in local time of the server (or UTC depending on env).
        // Best approach for consistency with `birthdate` being just a date (often stored as 00:00:00 UTC)
        // is to check UTC values if Prisma stores @db.Date as UTC midnight.
        // However, `today` is `new Date()`.
        // Let's assume standard simple comparison for now.

        const bMonth = birthdate.getUTCMonth();
        const bDay = birthdate.getUTCDate();

        // Compare with today's date. Since we can't easily know user's timezone offset here
        // without passing it from client, we'll try to match standard UTC.
        // BUT, `today` is `new Date()`.
        // Let's assume standard simple comparison for now.

        if (bMonth === currentMonth && bDay === currentDay) {
          const age = today.getFullYear() - birthdate.getFullYear();
          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            age,
          };
        }
        return null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return {
      success: true,
      data: todaysBirthdays,
    };
  } catch (error) {
    console.error("Error fetching today's birthdays:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};
