import { z } from "zod";
import { StockMoveType } from "@/prisma/prisma-client";

// Helper to create schemas with custom messages
const createStockMovementSchemas = (messages?: {
  productIdRequired?: string;
  moveTypeInvalid?: string;
  quantityInvalid?: string;
  quantityRequired?: string;
  unitCostInvalid?: string;
  noteMax?: string;
  idRequired?: string;
}) => {
  const baseStockMovementSchema = z.object({
    productId: z
      .string()
      .min(1, messages?.productIdRequired || "Product is required"),
    moveType: z.enum(StockMoveType),
    quantity: z.int({
      message: messages?.quantityInvalid || "Quantity must be a number",
    }),
    unitCost: z
      .string()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        {
          message:
            messages?.unitCostInvalid ||
            "Unit cost must be a valid positive number",
        },
      )
      .optional()
      .or(z.literal("")),
    branchId: z.string().optional().nullable(),
    note: z
      .string()
      .max(500, messages?.noteMax || "Note must be less than 500 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  });

  const createStockMovementSchema = baseStockMovementSchema;

  const updateStockMovementSchema = baseStockMovementSchema.extend({
    id: z
      .string()
      .min(1, messages?.idRequired || "Stock movement ID is required"),
  });

  return { createStockMovementSchema, updateStockMovementSchema };
};

// For client-side with i18n
export const getStockMovementSchemas = (t: (key: string) => string) => {
  return createStockMovementSchemas({
    productIdRequired: t("validation.productIdRequired"),
    moveTypeInvalid: t("validation.moveTypeInvalid"),
    quantityInvalid: t("validation.quantityInvalid"),
    quantityRequired: t("validation.quantityRequired"),
    unitCostInvalid: t("validation.unitCostInvalid"),
    noteMax: t("validation.noteMax"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createStockMovementSchema, updateStockMovementSchema } =
  createStockMovementSchemas();

export { createStockMovementSchema, updateStockMovementSchema };

export type CreateStockMovementInput = z.infer<
  typeof createStockMovementSchema
>;
export type UpdateStockMovementInput = z.infer<
  typeof updateStockMovementSchema
>;

export const stockTransferSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  fromBranchId: z.string().min(1, "Origin branch is required"),
  toBranchId: z.string().min(1, "Destination branch is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  note: z
    .string()
    .max(500, "Note must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type StockTransferInput = z.infer<typeof stockTransferSchema>;
