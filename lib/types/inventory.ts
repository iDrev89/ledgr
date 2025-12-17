import { StockMovement, Product } from "@/prisma/prisma-client";

export type { StockMovement };

export type StockMovementWithProduct = StockMovement & {
  product: Product;
};

export type ProductStock = {
  product: Product;
  currentStock: number;
  lastMovement?: StockMovement;
};
