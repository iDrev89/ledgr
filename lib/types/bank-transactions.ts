import { BankTransaction, Bank, User, SalePayment, AccountsReceivablePayment, Sale, AccountsReceivable, Expense } from "@/prisma/prisma-client";

export type { BankTransaction };

export type BankTransactionWithRelations = BankTransaction & {
  bank?: Bank;
  createdBy?: User;
  salePayment?: SalePayment & {
    sale?: Sale;
  };
  receivablePayment?: AccountsReceivablePayment & {
    receivable?: AccountsReceivable;
  };
  expense?: Expense;
  relatedBank?: Bank;
};

export type BankWithBalance = Bank & {
  _sum?: {
    amount: number | null;
  };
  currentBalance?: number;
  transactionCount?: number;
};

