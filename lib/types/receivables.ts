import {
  AccountsReceivable,
  AccountsReceivablePayment,
  Customer,
  Bank,
  Product,
} from "@/prisma/prisma-client";

export type { AccountsReceivable, AccountsReceivablePayment };

// Serialized Product for client (Decimal fields as strings)
export type SerializedProduct = Omit<Product, "price" | "cost" | "commissionPercent"> & {
  price: string;
  cost: string;
  commissionPercent: string;
};

// Serialized SaleItem for client
export type SerializedSaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  lineTotal: string;
  performedById: string | null;
  commissionPercentApplied: string | null;
  product: SerializedProduct;
  performedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

// Serialized version for client (Decimal fields converted to strings)
export type ReceivableWithDetails = Omit<
  AccountsReceivable,
  "total" | "balance"
> & {
  total: string;
  balance: string;
  customer: Customer;
  sale?: {
    id: string;
    saleNumber: number;
    createdAt: Date;
    total: string;
    subtotal?: string;
    discountTotal?: string;
    taxTotal?: string;
    note?: string | null;
    items?: SerializedSaleItem[];
  } | null;
  payments: (Omit<AccountsReceivablePayment, "amount"> & {
    amount: string;
    bank?: Bank | null;
  })[];
  _count?: {
    payments: number;
  };
};
