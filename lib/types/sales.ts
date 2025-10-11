import { Sale, SaleItem, SalePayment, Customer, Product, Bank } from "@/prisma/prisma-client";

export type { Sale, SaleItem, SalePayment };

// Serialized version for client (Decimal fields converted to strings)
export type SaleWithDetails = Omit<Sale, "subtotal" | "discountTotal" | "taxTotal" | "total"> & {
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
  items: (Omit<SaleItem, "unitPrice" | "discount" | "lineTotal"> & {
    unitPrice: string;
    discount: string;
    lineTotal: string;
    product: Omit<Product, "price" | "cost"> & {
      price: string;
      cost: string | null;
    };
  })[];
  payments: (Omit<SalePayment, "amount"> & {
    amount: string;
    bank?: Bank | null;
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

