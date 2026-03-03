import { Decimal } from "@prisma/client/runtime/library";
import type { PurchaseStatus, PaymentMethod } from "@/prisma/prisma-client";

export interface PurchaseItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseWithDetails {
  id: string;
  purchaseNumber: number;
  supplierId: string | null;
  supplier: {
    id: string;
    name: string;
  } | null;
  currency: string;
  invoiceNo: string | null;
  status: PurchaseStatus;
  note: string | null;

  paymentMethod: PaymentMethod;
  accountId: string | null;
  account: {
    id: string;
    name: string;
  } | null;
  reference: string | null;

  subtotal: Decimal;
  taxTotal: Decimal;
  total: Decimal;
  createdById: string | null;
  createdBy: {
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    unitCost: Decimal;
    lineTotal: Decimal;
  }[];
}

export interface CreatePurchaseInput {
  supplierId?: string | null;
  branchId?: string | null;
  invoiceNo?: string | null;
  note?: string | null;
  items: PurchaseItem[];
  taxTotal?: number;

  paymentMethod: PaymentMethod;
  accountId?: string | null;
  reference?: string | null;
}

export interface SerializedPurchase {
  id: string;
  purchaseNumber: number;
  supplierId: string | null;
  supplier: {
    id: string;
    name: string;
  } | null;
  currency: string;
  invoiceNo: string | null;
  status: PurchaseStatus;
  note: string | null;

  paymentMethod: PaymentMethod;
  accountId: string | null;
  account: {
    id: string;
    name: string;
  } | null;
  reference: string | null;

  subtotal: string;
  taxTotal: string;
  total: string;
  createdById: string | null;
  createdBy: {
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    unitCost: string;
    lineTotal: string;
  }[];
}
