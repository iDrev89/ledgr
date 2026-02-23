import type {
  CashSession,
  FinancialAccount,
  User,
  Branch,
} from "@/prisma/prisma-client";

export type { CashSession };

export type CashSessionWithRelations = Omit<
  CashSession,
  | "openingBalance"
  | "expectedBalance"
  | "actualBalance"
  | "difference"
  | "retainedAmount"
  | "depositAmount"
> & {
  openingBalance: string;
  expectedBalance: string | null;
  actualBalance: string | null;
  difference: string | null;
  retainedAmount: string | null;
  depositAmount: string | null;
  account: Pick<FinancialAccount, "id" | "name" | "type">;
  openedBy: Pick<User, "id" | "name">;
  closedBy?: Pick<User, "id" | "name"> | null;
  branch?: Pick<Branch, "id" | "name"> | null;
  depositAccount?: Pick<FinancialAccount, "id" | "name" | "type"> | null;
};

export type CashSessionTurnSummary = {
  incomeTotal: string;
  expenseTotal: string;
  transactionCount: number;
  expectedBalance: string;
};
