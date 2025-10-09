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
    productId: z.string().min(1, messages?.productIdRequired || "Product is required"),
    moveType: z.nativeEnum(StockMoveType),
    quantity: z
      .number({
        required_error: messages?.quantityRequired || "Quantity is required",
        invalid_type_error: messages?.quantityInvalid || "Quantity must be a number",
      })
      .int(messages?.quantityInvalid || "Quantity must be a whole number")
      .refine((val) => val !== 0, {
        message: messages?.quantityInvalid || "Quantity cannot be zero",
      }),
    unitCost: z
      .string()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        {
          message: messages?.unitCostInvalid || "Unit cost must be a valid positive number",
        }
      )
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .max(500, messages?.noteMax || "Note must be less than 500 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  });

  const createStockMovementSchema = baseStockMovementSchema;

  const updateStockMovementSchema = baseStockMovementSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Stock movement ID is required"),
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
const { createStockMovementSchema, updateStockMovementSchema } = createStockMovementSchemas();

export { createStockMovementSchema, updateStockMovementSchema };

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type UpdateStockMovementInput = z.infer<typeof updateStockMovementSchema>;

