import { Decimal } from "@prisma/client/runtime/library";
import type { PurchaseStatus, PaymentMethod } from "@/prisma/prisma-client";

// Date Range
export interface DateRange {
  start: Date;
  end: Date;
}

export type DatePreset = "today" | "week" | "month" | "year" | "custom";

// Purchase Report Types
export interface PurchaseReportFilters {
  startDate: Date;
  endDate: Date;
  status?: PurchaseStatus[];
  supplierId?: string;
}

export interface PurchaseReportItem {
  id: string;
  createdAt: Date;
  invoiceNo: string | null;
  supplier: {
    id: string;
    name: string;
  } | null;
  status: PurchaseStatus;
  subtotal: number;
  taxTotal: number;
  total: number;
  totalPaid: number;
  balance: number;
}

export interface PurchaseReportMetrics {
  totalPurchases: number;
  totalPaid: number;
  balance: number;
  count: number;
  average: number;
}

export interface PurchaseReportData {
  purchases: PurchaseReportItem[];
  metrics: PurchaseReportMetrics;
}

// Business Summary Types
export interface BusinessSummaryFilters {
  startDate: Date;
  endDate: Date;
}

export interface RevenueMetrics {
  total: number;
  count: number;
  average: number;
}

export interface CostMetrics {
  total: number;
  grossProfit: number;
  grossMargin: number;
}

export interface ExpenseMetrics {
  total: number;
  byCategory: CategoryExpense[];
}

export interface CategoryExpense {
  categoryId: string | null;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface ProfitMetrics {
  net: number;
  netMargin: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface CashFlowMetrics {
  cashReceived: number;
  cashSpent: number;
  netCash: number;
}

export interface TimelineDataPoint {
  date: string;
  sales: number;
  expenses: number;
}

export interface BusinessSummaryData {
  revenue: RevenueMetrics;
  costs: CostMetrics;
  expenses: ExpenseMetrics;
  profit: ProfitMetrics;
  topProducts: TopProduct[];
  cashFlow: CashFlowMetrics;
  timeline: TimelineDataPoint[];
}

// Comparative Metrics
export interface ComparativeMetrics<T> {
  current: T;
  previous: T;
  change: {
    [K in keyof T]: number; // percentage change
  };
}

// Purchase Item Detail
export interface PurchaseItemDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

// Purchase Payment Detail
export interface PurchasePaymentDetail {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  notes: string | null;
}

// Purchase Report Item with Details
export interface PurchaseReportItemDetailed extends PurchaseReportItem {
  items: PurchaseItemDetail[];
  payments: PurchasePaymentDetail[];
}

// Purchase by Supplier
export interface PurchaseBySupplier {
  supplierId: string | null;
  supplierName: string;
  totalPurchases: number;
  totalPaid: number;
  balance: number;
  count: number;
}

// Enhanced Purchase Report Data
export interface PurchaseReportDataEnhanced {
  purchases: PurchaseReportItemDetailed[];
  metrics: ComparativeMetrics<PurchaseReportMetrics>;
  bySupplier: PurchaseBySupplier[];
}

// Chart Data Types
export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface BarChartData {
  name: string;
  value: number;
  label?: string;
}

// Top Customer
export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalSpent: number;
  orderCount: number;
}

// Product Performance
export interface ProductPerformance extends TopProduct {
  cost: number;
  profit: number;
  margin: number; // percentage
}

// Sale Detail for Drill-down
export interface SaleDetail {
  id: string;
  saleNumber: number;
  createdAt: Date;
  customerName: string | null;
  total: number;
  itemCount: number;
  createdByName: string;
}

// Expense Detail for Drill-down
export interface ExpenseDetail {
  id: string;
  description: string;
  amount: number;
  categoryName: string | null;
  incurredAt: Date;
  createdByName: string;
}

// Chart Collections
export interface ChartData {
  salesTrend: TimelineDataPoint[];
  expensesByCategory: PieChartData[];
  topProducts: BarChartData[];
  topCustomers: BarChartData[];
}

// Enhanced Business Summary Data
export interface BusinessSummaryDataEnhanced {
  metrics: {
    revenue: ComparativeMetrics<RevenueMetrics>;
    costs: ComparativeMetrics<CostMetrics>;
    expenses: ComparativeMetrics<ExpenseMetrics>;
    profit: ComparativeMetrics<ProfitMetrics>;
  };
  cashFlow: CashFlowMetrics;
  charts: ChartData;
  topCustomers: TopCustomer[];
  productPerformance: ProductPerformance[];
  details: {
    salesBreakdown: SaleDetail[];
    expenseBreakdown: ExpenseDetail[];
  };
}

// View Mode
export type ViewMode = "summary" | "detailed";

// Metric Card Props
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void; // for drill-down
}

// Daily Sales Report Types
export interface DailySalesReportFilters {
  date: Date;
  sellerId?: string;
}

export interface DailySaleDetail {
  id: string;
  saleNumber: number;
  createdAt: Date;
  customerName: string | null;
  soldByName: string | null;
  itemCount: number;
  total: string;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMethods: string[];
}

export interface DailySalesReportData {
  metrics: {
    totalSales: number;
    salesCount: number;
    averageTicket: number;
    totalPaid: number;
    pendingBalance: number;
    byPaymentMethod: {
      method: string;
      total: number;
    }[];
  };
  sales: DailySaleDetail[];
}
