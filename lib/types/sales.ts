import {
  Sale,
  SaleItem,
  SalePayment,
  Customer,
  Product,
  FinancialAccount,
  SaleStatus,
} from "@/prisma/prisma-client";

export type { Sale, SaleItem, SalePayment, SaleStatus };

export type SaleWithDetails = Omit<
  Sale,
  "subtotal" | "discountTotal" | "taxTotal" | "total" | "tip"
> & {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  total: string;
  tip: string;
  customer: Customer;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  soldBy?: {
    id: string;
    name: string;
    email: string;
  };
  items: (Omit<
    SaleItem,
    "unitPrice" | "discount" | "lineTotal" | "commissionPercentApplied"
  > & {
    unitPrice: string;
    discount: string;
    lineTotal: string;
    commissionPercentApplied: string | null;
    product: Omit<Product, "price" | "cost" | "commissionPercent"> & {
      price: string;
      cost: string | null;
      commissionPercent: string | null;
    };
    performedBy?: {
      id: string;
      name: string;
      email: string;
    } | null;
  })[];
  payments: (Omit<SalePayment, "amount"> & {
    amount: string;
    account?: FinancialAccount | null;
    attachmentUrl?: string | null;
  })[];
  receivable?: {
    id: string;
    total: string;
    balance: string;
    status: string;
  } | null;
};

export type SaleWithStats = Sale & {
  customer: Customer;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  soldBy?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    items: number;
  };
};
