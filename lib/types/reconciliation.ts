import type {
  AccountReconciliation,
  ReconciliationItem,
  ReconciliationStatus,
  FinancialAccount,
  User,
  AccountTransaction,
} from "@/prisma/prisma-client";

export type { AccountReconciliation, ReconciliationItem, ReconciliationStatus };

export type ReconciliationWithRelations = AccountReconciliation & {
  account: Pick<FinancialAccount, "id" | "name" | "type">;
  reconciledBy?: Pick<User, "id" | "name"> | null;
  items: ReconciliationItemWithRelations[];
};

export type ReconciliationItemWithRelations = ReconciliationItem & {
  transaction?: Pick<
    AccountTransaction,
    "id" | "type" | "amount" | "description" | "transactionDate" | "reference"
  > | null;
};
