import { StockMovement, Product } from "@/prisma/prisma-client";

export type { StockMovement };

export type StockMovementWithProduct = StockMovement & {
  product: Product;
  branch?: { id: string; name: string } | null;
};

export type ProductStock = {
  product: Product;
  currentStock: number;
  lastMovement?: StockMovement;
};
