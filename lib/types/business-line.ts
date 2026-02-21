import { BusinessLine } from "@/prisma/prisma-client";

export type { BusinessLine };

export type BusinessLineWithRelations = BusinessLine & {
  _count?: {
    products: number;
    sales: number;
    expenses: number;
  };
};
