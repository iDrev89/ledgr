import { ProductCategory } from "@/prisma/prisma-client";

export type { ProductCategory };

export type ProductCategoryWithRelations = ProductCategory & {
  _count?: {
    products: number;
  };
};

