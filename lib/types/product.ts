import { Product } from "@/prisma/prisma-client";

export type { Product };

export type ProductWithStats = Product & {
  _count?: {
    saleItems: number;
    stockMoves: number;
    purchaseItems: number;
  };
  totalSales?: number;
  currentStock?: number;
};

