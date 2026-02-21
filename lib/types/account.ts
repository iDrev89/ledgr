import { FinancialAccount, AccountType } from "@/prisma/prisma-client";

export type { FinancialAccount, AccountType };

export type Account = FinancialAccount;

export type AccountWithRelations = FinancialAccount & {
  _count?: {
    salePayments: number;
    receivablePayments: number;
    purchases: number;
    transactions: number;
  };
};
