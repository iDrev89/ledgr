import type {
  CashRegisterClose,
  FinancialAccount,
  User,
  Branch,
} from "@/prisma/prisma-client";

export type { CashRegisterClose };

export type CashCloseWithRelations = CashRegisterClose & {
  account: Pick<FinancialAccount, "id" | "name" | "type">;
  closedBy: Pick<User, "id" | "name">;
  branch?: Pick<Branch, "id" | "name"> | null;
};
