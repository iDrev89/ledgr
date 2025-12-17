import {
  AccountsReceivable,
  AccountsReceivablePayment,
  Customer,
  Bank,
} from "@/prisma/prisma-client";

export type { AccountsReceivable, AccountsReceivablePayment };

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
  } | null;
  payments: (Omit<AccountsReceivablePayment, "amount"> & {
    amount: string;
    bank?: Bank | null;
  })[];
  _count?: {
    payments: number;
  };
};
