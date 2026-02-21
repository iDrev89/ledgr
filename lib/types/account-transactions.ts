import {
  AccountTransaction,
  FinancialAccount,
  User,
  SalePayment,
  AccountsReceivablePayment,
  Sale,
  AccountsReceivable,
  Expense,
} from "@/prisma/prisma-client";

export type { AccountTransaction };

export type AccountTransactionWithRelations = AccountTransaction & {
  account?: FinancialAccount;
  createdBy?: User;
  salePayment?: SalePayment & {
    sale?: Sale;
  };
  receivablePayment?: AccountsReceivablePayment & {
    receivable?: AccountsReceivable;
  };
  expense?: Expense;
  relatedAccount?: FinancialAccount;
};

export type AccountWithBalance = FinancialAccount & {
  _sum?: {
    amount: number | null;
  };
  currentBalance?: number;
  transactionCount?: number;
};
