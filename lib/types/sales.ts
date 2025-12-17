import {
  Sale,
  SaleItem,
  SalePayment,
  Customer,
  Product,
  Bank,
} from "@/prisma/prisma-client";

export type { Sale, SaleItem, SalePayment };

// Serialized version for client (Decimal fields converted to strings)
export type SaleWithDetails = Omit<
  Sale,
  "subtotal" | "discountTotal" | "taxTotal" | "total"
> & {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  total: string;
  customer: Customer;
  createdBy: {
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
    bank?: Bank | null;
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
  _count?: {
    items: number;
  };
};
