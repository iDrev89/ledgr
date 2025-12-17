import { Customer } from "@/prisma/prisma-client";

export type { Customer };

export type CustomerWithStats = Customer & {
  _count?: {
    sales: number;
    receivables: number;
  };
  totalSales?: number;
  totalReceivables?: number;
};
