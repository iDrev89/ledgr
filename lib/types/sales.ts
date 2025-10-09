import { Sale, SaleItem, Customer, Product } from "@/prisma/prisma-client";

export type { Sale, SaleItem };

export type SaleWithDetails = Sale & {
  customer: Customer;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  items: (SaleItem & {
    product: Product;
  })[];
};

export type SaleWithStats = Sale & {
  customer: Customer;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    items: number;
  };
};

