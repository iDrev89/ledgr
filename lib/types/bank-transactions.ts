import { BankTransaction, Bank, User, SalePayment, AccountsReceivablePayment } from "@/prisma/prisma-client";

export type { BankTransaction };

export type BankTransactionWithRelations = BankTransaction & {
  bank?: Bank;
  createdBy?: User;
  salePayment?: SalePayment;
  receivablePayment?: AccountsReceivablePayment;
  relatedBank?: Bank;
};

export type BankWithBalance = Bank & {
  _sum?: {
    amount: number | null;
  };
  currentBalance?: number;
  transactionCount?: number;
};

