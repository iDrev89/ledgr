import { z } from "zod";
import { ProductType } from "@/prisma/prisma-client";

// Helper to create schemas with custom messages
const createProductSchemas = (messages?: {
  typeInvalid?: string;
  skuMax?: string;
  nameMin?: string;
  nameMax?: string;
  descriptionMax?: string;
  priceInvalid?: string;
  costInvalid?: string;
  commissionPercentInvalid?: string;
  categoryIdRequired?: string;
  idRequired?: string;
}) => {
  const baseProductSchema = z.object({
    type: z.enum(ProductType, {
      message: "Invalid product type",
    }),
    sku: z
      .string()
      .max(50, messages?.skuMax || "SKU must be less than 50 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(200, messages?.nameMax || "Name must be less than 200 characters")
      .trim(),
    description: z
      .string()
      .max(1000, messages?.descriptionMax || "Description must be less than 1000 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    price: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: messages?.priceInvalid || "Price must be a valid positive number",
      }),
    cost: z
      .string()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        {
          message: messages?.costInvalid || "Cost must be a valid positive number",
        }
      )
      .optional()
      .or(z.literal("")),
    commissionPercent: z
      .string()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100),
        {
          message: messages?.commissionPercentInvalid || "Commission percent must be between 0 and 100",
        }
      )
      .optional()
      .or(z.literal("")),
    categoryId: z.string().min(1, messages?.categoryIdRequired || "Category is required"),
    active: z.boolean(),
  });

  const createProductSchema = baseProductSchema;

  const updateProductSchema = baseProductSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Product ID is required"),
  });

  return { createProductSchema, updateProductSchema };
};

// For client-side with i18n
export const getProductSchemas = (t: (key: string) => string) => {
  return createProductSchemas({
    typeInvalid: t("validation.typeInvalid"),
    skuMax: t("validation.skuMax"),
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    descriptionMax: t("validation.descriptionMax"),
    priceInvalid: t("validation.priceInvalid"),
    costInvalid: t("validation.costInvalid"),
    commissionPercentInvalid: t("validation.commissionPercentInvalid"),
    categoryIdRequired: t("validation.categoryIdRequired"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createProductSchema, updateProductSchema } = createProductSchemas();

export { createProductSchema, updateProductSchema };

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

