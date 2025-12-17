import { z } from "zod";

export const purchaseItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Producto requerido"),
  productName: z.string().optional(),
  quantity: z.number().int().min(1, "Cantidad debe ser al menos 1"),
  unitCost: z.number().min(0, "Costo unitario debe ser positivo"),
  lineTotal: z.number().min(0),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().nullable().optional(),
  invoiceNo: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z
    .array(purchaseItemSchema)
    .min(1, "Debe agregar al menos un item"),
  taxTotal: z.number().min(0).default(0),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;

