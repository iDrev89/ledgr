import { Decimal } from "@prisma/client/runtime/library";
import type { PurchaseStatus, PaymentMethod } from "@/prisma/prisma-client";

// Purchase Item
export interface PurchaseItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

// Purchase with details
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

  // Campos de pago
  paymentMethod: PaymentMethod;
  bankId: string | null;
  bank: {
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

// Create Purchase Input
export interface CreatePurchaseInput {
  supplierId?: string | null;
  invoiceNo?: string | null;
  note?: string | null;
  items: PurchaseItem[];
  taxTotal?: number;

  // Campos de pago
  paymentMethod: PaymentMethod;
  bankId?: string | null;
  reference?: string | null;
}

// Serialized Purchase (for client)
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

  // Campos de pago
  paymentMethod: PaymentMethod;
  bankId: string | null;
  bank: {
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
