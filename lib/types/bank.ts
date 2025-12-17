import { Bank } from "@/prisma/prisma-client";

export type { Bank };

export type BankWithRelations = Bank & {
  _count?: {
    salePayments: number;
    receivablePayments: number;
    purchasePayments: number;
  };
};
