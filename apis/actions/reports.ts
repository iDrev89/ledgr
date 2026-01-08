"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { getTranslations } from "next-intl/server";
import { Decimal } from "@prisma/client/runtime/library";
import { StockMoveType, PaymentMethod } from "@/prisma/prisma-client";
import type {
  PurchaseReportFilters,
  PurchaseReportData,
  PurchaseReportItem,
  PurchaseReportDataEnhanced,
  PurchaseReportItemDetailed,
  PurchaseItemDetail,
  PurchasePaymentDetail,
  PurchaseBySupplier,
  ComparativeMetrics,
  PurchaseReportMetrics,
  BusinessSummaryFilters,
  BusinessSummaryData,
  BusinessSummaryDataEnhanced,
  CategoryExpense,
  TopProduct,
  TopCustomer,
  ProductPerformance,
  SaleDetail,
  ExpenseDetail,
  TimelineDataPoint,
  PieChartData,
  BarChartData,
  ChartData,
  RevenueMetrics,
  CostMetrics,
  ExpenseMetrics,
  ProfitMetrics,
  DailySalesReportFilters,
  DailySalesReportData,
  DailySaleDetail,
} from "@/lib/types/reports";
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  differenceInDays,
} from "date-fns";

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

// Helper to convert Decimal to number
const toNumber = (value: Decimal | null | undefined): number => {
  if (!value) return 0;
  return parseFloat(value.toString());
};

/**
 * Get Purchase Report Data
 */
export async function getPurchaseReport(
  filters: PurchaseReportFilters,
): Promise<ActionResponse<PurchaseReportData>> {
  const t = await getTranslations("Reports");

  try {
    await requireAuth();

    // Parse date strings to Date objects
    const startDateObj = new Date(filters.startDate + "T00:00:00.000");
    const endDateObj = new Date(filters.endDate + "T00:00:00.000");

    const purchases = await prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: startOfDay(startDateObj),
          lte: endOfDay(endDateObj),
        },
        status:
          filters.status && filters.status.length > 0
            ? { in: filters.status }
            : undefined,
        supplierId: filters.supplierId || undefined,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform and calculate
    // Las compras APPROVED están pagadas completamente
    const items: PurchaseReportItem[] = purchases.map((purchase) => {
      const total = toNumber(purchase.total);
      const totalPaid = purchase.status === "APPROVED" ? total : 0;
      const balance = total - totalPaid;

      return {
        id: purchase.id,
        createdAt: purchase.createdAt,
        invoiceNo: purchase.invoiceNo,
        supplier: purchase.supplier,
        status: purchase.status,
        subtotal: toNumber(purchase.subtotal),
        taxTotal: toNumber(purchase.taxTotal),
        total: total,
        totalPaid: totalPaid,
        balance: balance,
      };
    });

    // Calculate metrics
    const totalPurchases = items.reduce((sum, item) => sum + item.total, 0);
    const totalPaid = items.reduce((sum, item) => sum + item.totalPaid, 0);
    const balance = totalPurchases - totalPaid;
    const count = items.length;
    const average = count > 0 ? totalPurchases / count : 0;

    const data: PurchaseReportData = {
      purchases: items,
      metrics: {
        totalPurchases,
        totalPaid,
        balance,
        count,
        average,
      },
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error getting purchase report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("errorLoading"),
    };
  }
}

/**
 * Get Enhanced Purchase Report Data with Comparatives
 */
export async function getPurchaseReportEnhanced(
  filters: PurchaseReportFilters,
): Promise<ActionResponse<PurchaseReportDataEnhanced>> {
  const t = await getTranslations("Reports");

  try {
    await requireAuth();

    // Parse date strings to Date objects
    const startDateObj = new Date(filters.startDate + "T00:00:00.000");
    const endDateObj = new Date(filters.endDate + "T00:00:00.000");

    const startDate = startOfDay(startDateObj);
    const endDate = endOfDay(endDateObj);

    // Calculate previous period dates
    const daysDiff = differenceInDays(endDate, startDate);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff - 1);
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    // Fetch current period purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status:
          filters.status && filters.status.length > 0
            ? { in: filters.status }
            : undefined,
        supplierId: filters.supplierId || undefined,
      },
      include: {
        supplier: {
          select: {
            id: true,
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

    // Fetch previous period purchases for comparison
    const previousPurchases = await prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
        status:
          filters.status && filters.status.length > 0
            ? { in: filters.status }
            : undefined,
        supplierId: filters.supplierId || undefined,
      },
    });

    // Transform current period purchases with details
    const detailedItems: PurchaseReportItemDetailed[] = purchases.map(
      (purchase) => {
        const total = toNumber(purchase.total);
        const totalPaid = purchase.status === "APPROVED" ? total : 0;
        const balance = total - totalPaid;

        const items: PurchaseItemDetail[] = purchase.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitCost: toNumber(item.unitCost),
          lineTotal: toNumber(item.lineTotal),
        }));

        // Las compras ahora tienen un solo pago integrado
        const payments: PurchasePaymentDetail[] =
          purchase.status === "APPROVED"
            ? [
                {
                  id: purchase.id,
                  amount: total,
                  method: purchase.paymentMethod,
                  paidAt: purchase.createdAt,
                  notes: purchase.reference || null,
                },
              ]
            : [];

        return {
          id: purchase.id,
          createdAt: purchase.createdAt,
          invoiceNo: purchase.invoiceNo,
          supplier: purchase.supplier,
          status: purchase.status,
          subtotal: toNumber(purchase.subtotal),
          taxTotal: toNumber(purchase.taxTotal),
          total: total,
          totalPaid: totalPaid,
          balance: balance,
          items,
          payments,
        };
      },
    );

    // Calculate current period metrics
    const currentMetrics: PurchaseReportMetrics = {
      totalPurchases: detailedItems.reduce((sum, item) => sum + item.total, 0),
      totalPaid: detailedItems.reduce((sum, item) => sum + item.totalPaid, 0),
      balance: 0,
      count: detailedItems.length,
      average: 0,
    };
    currentMetrics.balance =
      currentMetrics.totalPurchases - currentMetrics.totalPaid;
    currentMetrics.average =
      currentMetrics.count > 0
        ? currentMetrics.totalPurchases / currentMetrics.count
        : 0;

    // Calculate previous period metrics
    const previousMetrics: PurchaseReportMetrics = {
      totalPurchases: previousPurchases.reduce(
        (sum, p) => sum + toNumber(p.total),
        0,
      ),
      totalPaid: previousPurchases.reduce(
        (sum, p) => sum + (p.status === "APPROVED" ? toNumber(p.total) : 0),
        0,
      ),
      balance: 0,
      count: previousPurchases.length,
      average: 0,
    };
    previousMetrics.balance =
      previousMetrics.totalPurchases - previousMetrics.totalPaid;
    previousMetrics.average =
      previousMetrics.count > 0
        ? previousMetrics.totalPurchases / previousMetrics.count
        : 0;

    // Calculate percentage changes
    const change: Record<keyof PurchaseReportMetrics, number> = {
      totalPurchases:
        previousMetrics.totalPurchases > 0
          ? ((currentMetrics.totalPurchases - previousMetrics.totalPurchases) /
              previousMetrics.totalPurchases) *
            100
          : 0,
      totalPaid:
        previousMetrics.totalPaid > 0
          ? ((currentMetrics.totalPaid - previousMetrics.totalPaid) /
              previousMetrics.totalPaid) *
            100
          : 0,
      balance:
        previousMetrics.balance > 0
          ? ((currentMetrics.balance - previousMetrics.balance) /
              previousMetrics.balance) *
            100
          : 0,
      count:
        previousMetrics.count > 0
          ? ((currentMetrics.count - previousMetrics.count) /
              previousMetrics.count) *
            100
          : 0,
      average:
        previousMetrics.average > 0
          ? ((currentMetrics.average - previousMetrics.average) /
              previousMetrics.average) *
            100
          : 0,
    };

    const data: PurchaseReportDataEnhanced = {
      purchases: detailedItems,
      metrics: {
        current: currentMetrics,
        previous: previousMetrics,
        change,
      },
      bySupplier: [], // No hay asociación con proveedores
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error getting enhanced purchase report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("errorLoading"),
    };
  }
}

/**
 * Get Business Summary Data
 */
export async function getBusinessSummary(
  filters: BusinessSummaryFilters,
): Promise<ActionResponse<BusinessSummaryData>> {
  const t = await getTranslations("Reports");

  try {
    await requireAuth();

    // Parse date strings to Date objects
    const startDateObj = new Date(filters.startDate + "T00:00:00.000");
    const endDateObj = new Date(filters.endDate + "T00:00:00.000");

    const startDate = startOfDay(startDateObj);
    const endDate = endOfDay(endDateObj);

    // 1. Get sales (only COMPLETED)
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                cost: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            method: true,
          },
        },
      },
    });

    // 2. Get stock movements (for COGS)
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        moveType: StockMoveType.SALE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        quantity: true,
        unitCost: true,
        createdAt: true,
      },
    });

    // 3. Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        incurredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate Revenue
    const revenue = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0);
    const salesCount = sales.length;
    const averageTicket = salesCount > 0 ? revenue / salesCount : 0;

    // Calculate COGS
    const cogs = stockMovements.reduce((sum, movement) => {
      return sum + movement.quantity * toNumber(movement.unitCost);
    }, 0);

    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // Calculate Expenses by Category
    const expensesByCategory: Map<string, CategoryExpense> = new Map();
    let totalExpenses = 0;

    expenses.forEach((expense) => {
      const amount = toNumber(expense.amount);
      totalExpenses += amount;

      const categoryId = expense.category?.id || null;
      const categoryName = expense.category?.name || t("uncategorized");

      if (expensesByCategory.has(categoryId || "uncategorized")) {
        const existing = expensesByCategory.get(categoryId || "uncategorized")!;
        existing.total += amount;
      } else {
        expensesByCategory.set(categoryId || "uncategorized", {
          categoryId,
          categoryName,
          total: amount,
          percentage: 0, // Will calculate after
        });
      }
    });

    // Calculate percentages
    const expensesByCategoryArray = Array.from(expensesByCategory.values()).map(
      (cat) => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
      }),
    );

    // Sort by total descending and take top 5
    expensesByCategoryArray.sort((a, b) => b.total - a.total);

    // Calculate Profit
    const netProfit = grossProfit - totalExpenses;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Calculate Top Products
    const productSales: Map<string, TopProduct> = new Map();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.product.id;
        const productName = item.product.name;
        const quantity = item.quantity;
        const lineTotal = toNumber(item.lineTotal);

        if (productSales.has(productId)) {
          const existing = productSales.get(productId)!;
          existing.quantitySold += quantity;
          existing.revenue += lineTotal;
        } else {
          productSales.set(productId, {
            productId,
            productName,
            quantitySold: quantity,
            revenue: lineTotal,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate Cash Flow
    const cashReceived = sales.reduce((sum, sale) => {
      return (
        sum +
        sale.payments
          .filter((p) => p.method === PaymentMethod.CASH)
          .reduce((s, p) => s + toNumber(p.amount), 0)
      );
    }, 0);

    const cashSpent = expenses
      .filter((e) => e.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, e) => sum + toNumber(e.amount), 0);

    const netCash = cashReceived - cashSpent;

    // Generate Timeline
    const timeline = generateTimeline(sales, expenses, startDate, endDate);

    const data: BusinessSummaryData = {
      revenue: {
        total: revenue,
        count: salesCount,
        average: averageTicket,
      },
      costs: {
        total: cogs,
        grossProfit,
        grossMargin,
      },
      expenses: {
        total: totalExpenses,
        byCategory: expensesByCategoryArray,
      },
      profit: {
        net: netProfit,
        netMargin,
      },
      topProducts,
      cashFlow: {
        cashReceived,
        cashSpent,
        netCash,
      },
      timeline,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error getting business summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("errorLoading"),
    };
  }
}

/**
 * Get Enhanced Business Summary Data with Comparatives and Drill-down
 */
export async function getBusinessSummaryEnhanced(
  filters: BusinessSummaryFilters,
): Promise<ActionResponse<BusinessSummaryDataEnhanced>> {
  const t = await getTranslations("Reports");

  try {
    await requireAuth();

    // Parse date strings to Date objects
    const startDateObj = new Date(filters.startDate + "T00:00:00.000");
    const endDateObj = new Date(filters.endDate + "T00:00:00.000");

    const startDate = startOfDay(startDateObj);
    const endDate = endOfDay(endDateObj);

    // Calculate previous period dates
    const daysDiff = differenceInDays(endDate, startDate);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff - 1);
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    // Fetch current period sales (only COMPLETED)
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                cost: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            method: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch previous period sales (only COMPLETED)
    const previousSales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                cost: true,
              },
            },
          },
        },
      },
    });

    // Get stock movements for COGS (current period)
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        moveType: StockMoveType.SALE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        quantity: true,
        unitCost: true,
      },
    });

    // Get stock movements for COGS (previous period)
    const previousStockMovements = await prisma.stockMovement.findMany({
      where: {
        moveType: StockMoveType.SALE,
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      select: {
        quantity: true,
        unitCost: true,
      },
    });

    // Get expenses (current period)
    const expenses = await prisma.expense.findMany({
      where: {
        incurredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
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
      },
    });

    // Get expenses (previous period)
    const previousExpenses = await prisma.expense.findMany({
      where: {
        incurredAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Calculate current period revenue metrics
    const currentRevenue = sales.reduce(
      (sum, sale) => sum + toNumber(sale.total),
      0,
    );
    const currentRevenueMetrics: RevenueMetrics = {
      total: currentRevenue,
      count: sales.length,
      average: sales.length > 0 ? currentRevenue / sales.length : 0,
    };

    // Calculate previous period revenue metrics
    const previousRevenue = previousSales.reduce(
      (sum, sale) => sum + toNumber(sale.total),
      0,
    );
    const previousRevenueMetrics: RevenueMetrics = {
      total: previousRevenue,
      count: previousSales.length,
      average:
        previousSales.length > 0 ? previousRevenue / previousSales.length : 0,
    };

    // Calculate COGS (current and previous)
    const currentCogs = stockMovements.reduce(
      (sum, m) => sum + m.quantity * toNumber(m.unitCost),
      0,
    );
    const previousCogs = previousStockMovements.reduce(
      (sum, m) => sum + m.quantity * toNumber(m.unitCost),
      0,
    );

    const currentCostMetrics: CostMetrics = {
      total: currentCogs,
      grossProfit: currentRevenue - currentCogs,
      grossMargin:
        currentRevenue > 0
          ? ((currentRevenue - currentCogs) / currentRevenue) * 100
          : 0,
    };

    const previousCostMetrics: CostMetrics = {
      total: previousCogs,
      grossProfit: previousRevenue - previousCogs,
      grossMargin:
        previousRevenue > 0
          ? ((previousRevenue - previousCogs) / previousRevenue) * 100
          : 0,
    };

    // Calculate expenses (current)
    const currentTotalExpenses = expenses.reduce(
      (sum, e) => sum + toNumber(e.amount),
      0,
    );
    const expensesByCategory: Map<string, { name: string; total: number }> =
      new Map();
    expenses.forEach((expense) => {
      const categoryId = expense.category?.id || "uncategorized";
      const categoryName = expense.category?.name || t("uncategorized");
      if (expensesByCategory.has(categoryId)) {
        expensesByCategory.get(categoryId)!.total += toNumber(expense.amount);
      } else {
        expensesByCategory.set(categoryId, {
          name: categoryName,
          total: toNumber(expense.amount),
        });
      }
    });

    const expensesByCategoryArray: PieChartData[] = Array.from(
      expensesByCategory.entries(),
    )
      .map(([id, data]) => ({
        name: data.name,
        value: data.total,
        percentage:
          currentTotalExpenses > 0
            ? (data.total / currentTotalExpenses) * 100
            : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const currentExpenseMetrics: ExpenseMetrics = {
      total: currentTotalExpenses,
      byCategory: expensesByCategoryArray.map((cat) => ({
        categoryId: null,
        categoryName: cat.name,
        total: cat.value,
        percentage: cat.percentage,
      })),
    };

    // Calculate expenses (previous)
    const previousTotalExpenses = previousExpenses.reduce(
      (sum, e) => sum + toNumber(e.amount),
      0,
    );
    const previousExpensesByCategory: Map<string, { total: number }> =
      new Map();
    previousExpenses.forEach((expense) => {
      const categoryName = expense.category?.name || t("uncategorized");
      if (previousExpensesByCategory.has(categoryName)) {
        previousExpensesByCategory.get(categoryName)!.total += toNumber(
          expense.amount,
        );
      } else {
        previousExpensesByCategory.set(categoryName, {
          total: toNumber(expense.amount),
        });
      }
    });

    const previousExpenseMetrics: ExpenseMetrics = {
      total: previousTotalExpenses,
      byCategory: Array.from(previousExpensesByCategory.entries()).map(
        ([name, data]) => ({
          categoryId: null,
          categoryName: name,
          total: data.total,
          percentage:
            previousTotalExpenses > 0
              ? (data.total / previousTotalExpenses) * 100
              : 0,
        }),
      ),
    };

    // Calculate profit metrics
    const currentNetProfit =
      currentCostMetrics.grossProfit - currentTotalExpenses;
    const currentProfitMetrics: ProfitMetrics = {
      net: currentNetProfit,
      netMargin:
        currentRevenue > 0 ? (currentNetProfit / currentRevenue) * 100 : 0,
    };

    const previousNetProfit =
      previousCostMetrics.grossProfit - previousTotalExpenses;
    const previousProfitMetrics: ProfitMetrics = {
      net: previousNetProfit,
      netMargin:
        previousRevenue > 0 ? (previousNetProfit / previousRevenue) * 100 : 0,
    };

    // Calculate changes
    const revenueChange = {
      total:
        previousRevenueMetrics.total > 0
          ? ((currentRevenueMetrics.total - previousRevenueMetrics.total) /
              previousRevenueMetrics.total) *
            100
          : 0,
      count:
        previousRevenueMetrics.count > 0
          ? ((currentRevenueMetrics.count - previousRevenueMetrics.count) /
              previousRevenueMetrics.count) *
            100
          : 0,
      average:
        previousRevenueMetrics.average > 0
          ? ((currentRevenueMetrics.average - previousRevenueMetrics.average) /
              previousRevenueMetrics.average) *
            100
          : 0,
    };

    const costChange = {
      total:
        previousCostMetrics.total > 0
          ? ((currentCostMetrics.total - previousCostMetrics.total) /
              previousCostMetrics.total) *
            100
          : 0,
      grossProfit:
        previousCostMetrics.grossProfit > 0
          ? ((currentCostMetrics.grossProfit -
              previousCostMetrics.grossProfit) /
              previousCostMetrics.grossProfit) *
            100
          : 0,
      grossMargin:
        previousCostMetrics.grossMargin > 0
          ? ((currentCostMetrics.grossMargin -
              previousCostMetrics.grossMargin) /
              previousCostMetrics.grossMargin) *
            100
          : 0,
    };

    const expenseChange = {
      total:
        previousExpenseMetrics.total > 0
          ? ((currentExpenseMetrics.total - previousExpenseMetrics.total) /
              previousExpenseMetrics.total) *
            100
          : 0,
      byCategory: [] as any,
    };

    const profitChange = {
      net:
        previousProfitMetrics.net !== 0
          ? ((currentProfitMetrics.net - previousProfitMetrics.net) /
              Math.abs(previousProfitMetrics.net)) *
            100
          : 0,
      netMargin:
        previousProfitMetrics.netMargin > 0
          ? ((currentProfitMetrics.netMargin -
              previousProfitMetrics.netMargin) /
              previousProfitMetrics.netMargin) *
            100
          : 0,
    };

    // Top products with performance
    const productSalesMap: Map<string, ProductPerformance> = new Map();
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.product.id;
        const productName = item.product.name;
        const quantity = item.quantity;
        const revenue = toNumber(item.lineTotal);
        const productCost = item.product.cost ? toNumber(item.product.cost) : 0;
        const cost = item.quantity * productCost;
        const profit = revenue - cost;

        if (productSalesMap.has(productId)) {
          const existing = productSalesMap.get(productId)!;
          existing.quantitySold += quantity;
          existing.revenue += revenue;
          existing.cost += cost;
          existing.profit += profit;
        } else {
          productSalesMap.set(productId, {
            productId,
            productName,
            quantitySold: quantity,
            revenue,
            cost,
            profit,
            margin: 0,
          });
        }
      });
    });

    const productPerformance = Array.from(productSalesMap.values())
      .map((p) => ({
        ...p,
        margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    // Top customers
    const customerSalesMap: Map<string, TopCustomer> = new Map();
    sales.forEach((sale) => {
      if (sale.customer) {
        const customerId = sale.customer.id;
        const customerName = sale.customer.name;
        const total = toNumber(sale.total);

        if (customerSalesMap.has(customerId)) {
          const existing = customerSalesMap.get(customerId)!;
          existing.totalSpent += total;
          existing.orderCount += 1;
        } else {
          customerSalesMap.set(customerId, {
            customerId,
            customerName,
            totalSpent: total,
            orderCount: 1,
          });
        }
      }
    });

    const topCustomers = Array.from(customerSalesMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);

    // Cash flow
    const cashReceived = sales.reduce(
      (sum, sale) =>
        sum +
        sale.payments
          .filter((p) => p.method === PaymentMethod.CASH)
          .reduce((s, p) => s + toNumber(p.amount), 0),
      0,
    );

    const cashSpent = expenses
      .filter((e) => e.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, e) => sum + toNumber(e.amount), 0);

    // Sales and expense breakdowns for drill-down
    const salesBreakdown: SaleDetail[] = sales.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      createdAt: sale.createdAt,
      customerName: sale.customer?.name || null,
      total: toNumber(sale.total),
      itemCount: sale.items.length,
      createdByName: sale.createdBy.name || "",
    }));

    const expenseBreakdown: ExpenseDetail[] = expenses.map((expense) => ({
      id: expense.id,
      description: expense.description || "",
      amount: toNumber(expense.amount),
      categoryName: expense.category?.name || null,
      incurredAt: expense.incurredAt,
      createdByName: expense.createdBy?.name || "",
    }));

    // Chart data
    const topProductsChart: BarChartData[] = productPerformance
      .slice(0, 10)
      .map((p) => ({
        name: p.productName,
        value: p.revenue,
        label: `${p.quantitySold} uds`,
      }));

    const topCustomersChart: BarChartData[] = topCustomers
      .slice(0, 10)
      .map((c) => ({
        name: c.customerName,
        value: c.totalSpent,
        label: `${c.orderCount} compras`,
      }));

    const timeline = generateTimeline(sales, expenses, startDate, endDate);

    const data: BusinessSummaryDataEnhanced = {
      metrics: {
        revenue: {
          current: currentRevenueMetrics,
          previous: previousRevenueMetrics,
          change: revenueChange,
        },
        costs: {
          current: currentCostMetrics,
          previous: previousCostMetrics,
          change: costChange,
        },
        expenses: {
          current: currentExpenseMetrics,
          previous: previousExpenseMetrics,
          change: expenseChange,
        },
        profit: {
          current: currentProfitMetrics,
          previous: previousProfitMetrics,
          change: profitChange,
        },
      },
      cashFlow: {
        cashReceived,
        cashSpent,
        netCash: cashReceived - cashSpent,
      },
      charts: {
        salesTrend: timeline,
        expensesByCategory: expensesByCategoryArray,
        topProducts: topProductsChart,
        topCustomers: topCustomersChart,
      },
      topCustomers,
      productPerformance,
      details: {
        salesBreakdown,
        expenseBreakdown,
      },
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error getting enhanced business summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("errorLoading"),
    };
  }
}

/**
 * Generate timeline data based on date range
 */
function generateTimeline(
  sales: any[],
  expenses: any[],
  startDate: Date,
  endDate: Date,
): TimelineDataPoint[] {
  const daysDiff = differenceInDays(endDate, startDate);

  let intervals: Date[];
  let formatPattern: string;

  if (daysDiff <= 7) {
    // Daily for up to 7 days
    intervals = eachDayOfInterval({ start: startDate, end: endDate });
    formatPattern = "MMM dd";
  } else if (daysDiff <= 60) {
    // Weekly for up to 2 months
    intervals = eachWeekOfInterval({ start: startDate, end: endDate });
    formatPattern = "MMM dd";
  } else {
    // Monthly for longer periods
    intervals = eachMonthOfInterval({ start: startDate, end: endDate });
    formatPattern = "MMM yyyy";
  }

  return intervals.map((date) => {
    const nextDate = new Date(date);
    if (daysDiff <= 7) {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (daysDiff <= 60) {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const salesInPeriod = sales.filter(
      (s) => s.createdAt >= date && s.createdAt < nextDate,
    );
    const expensesInPeriod = expenses.filter(
      (e) => e.incurredAt >= date && e.incurredAt < nextDate,
    );

    const salesTotal = salesInPeriod.reduce(
      (sum, s) => sum + toNumber(s.total),
      0,
    );
    const expensesTotal = expensesInPeriod.reduce(
      (sum, e) => sum + toNumber(e.amount),
      0,
    );

    return {
      date: format(date, formatPattern),
      sales: salesTotal,
      expenses: expensesTotal,
    };
  });
}

/**
 * Get Daily Sales Report
 */
export async function getDailySalesReport(
  filters: DailySalesReportFilters,
): Promise<ActionResponse<DailySalesReportData>> {
  const t = await getTranslations("Reports");

  try {
    const session = await requireAuth();

    // Parse the date string to Date object
    // filters.date comes as ISO string (YYYY-MM-DD)
    const dateObj = new Date(filters.date + "T00:00:00.000");

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startOfDay(dateObj),
        lte: endOfDay(dateObj),
      },
      status: "COMPLETED", // Only show completed sales in reports
    };

    // Filter by seller if provided (only for admins)
    if (filters.sellerId) {
      where.soldById = filters.sellerId;
    } else if (session.user.role !== "admin") {
      // Non-admin users can only see their own sales
      where.soldById = session.user.id;
    }

    // Fetch sales with all related data
    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        soldBy: {
          select: {
            name: true,
          },
        },
        items: {
          select: {
            id: true,
          },
        },
        receivable: {
          select: {
            balance: true,
            status: true,
          },
        },
        payments: {
          select: {
            method: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate metrics
    const totalSales = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0);
    const salesCount = sales.length;
    const averageTicket = salesCount > 0 ? totalSales / salesCount : 0;

    // Calculate totals by payment method and total paid
    const paymentMethodTotals = new Map<string, number>();
    let totalPaid = 0;
    
    sales.forEach((sale) => {
      if (sale.payments && sale.payments.length > 0) {
        sale.payments.forEach((payment) => {
          const method = payment.method;
          const amount = toNumber(payment.amount);
          totalPaid += amount;
          const currentTotal = paymentMethodTotals.get(method) || 0;
          paymentMethodTotals.set(method, currentTotal + amount);
        });
      }
    });

    const byPaymentMethod = Array.from(paymentMethodTotals.entries()).map(
      ([method, total]) => ({
        method,
        total,
      })
    );

    // Calculate pending balance
    const pendingBalance = totalSales - totalPaid;

    // Map sales to detail format
    const salesDetails: DailySaleDetail[] = sales.map((sale) => {
      // Determine payment status
      let paymentStatus: 'paid' | 'partial' | 'pending';
      if (!sale.receivable) {
        paymentStatus = 'paid';
      } else if (sale.receivable.status === 'PAID') {
        paymentStatus = 'paid';
      } else if (sale.receivable.status === 'PARTIAL') {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'pending';
      }

      // Get unique payment methods
      const paymentMethods = sale.payments && sale.payments.length > 0
        ? [...new Set(sale.payments.map((p) => p.method))]
        : [];

      return {
        id: sale.id,
        saleNumber: sale.saleNumber,
        createdAt: sale.createdAt,
        customerName: sale.customer?.name || null,
        soldByName: sale.soldBy?.name || null,
        itemCount: sale.items.length,
        total: sale.total.toString(),
        paymentStatus,
        paymentMethods,
      };
    });

    return {
      success: true,
      data: {
        metrics: {
          totalSales,
          salesCount,
          averageTicket,
          totalPaid,
          pendingBalance,
          byPaymentMethod,
        },
        sales: salesDetails,
      },
    };
  } catch (error) {
    console.error("Error fetching daily sales report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("errorLoading"),
    };
  }
}
