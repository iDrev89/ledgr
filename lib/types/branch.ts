import { Branch, UserBranch } from "@/prisma/prisma-client";

export type { Branch, UserBranch };

export type BranchWithRelations = Branch & {
  _count?: {
    financialAccounts: number;
    sales: number;
    expenses: number;
    purchases: number;
    users: number;
  };
};

export type UserBranchWithRelations = UserBranch & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  branch?: Branch;
};
