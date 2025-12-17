import { ExpenseCategory } from "@/prisma/prisma-client";

export type { ExpenseCategory };

export type ExpenseCategoryWithRelations = ExpenseCategory & {
  _count?: {
    expenses: number;
    expenseItems: number;
  };
};
