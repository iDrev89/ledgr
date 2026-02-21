import {
  Expense,
  ExpenseItem,
  ExpenseCategory,
  Supplier,
  FinancialAccount,
} from "@/prisma/prisma-client";

export type { Expense, ExpenseItem };

export type ExpenseWithDetails = Expense & {
  category?: ExpenseCategory | null;
  supplier?: Supplier | null;
  account?: FinancialAccount | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  items?: ExpenseItem[];
};

export type ExpenseWithStats = Expense & {
  category?: ExpenseCategory | null;
  supplier?: Supplier | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    items: number;
  };
};
