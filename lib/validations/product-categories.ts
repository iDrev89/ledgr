import { z } from "zod";

// Helper to create schemas with custom messages
const createProductCategorySchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  nameRequired?: string;
  idRequired?: string;
}) => {
  const baseProductCategorySchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    active: z.boolean(),
  });

  const createProductCategorySchema = baseProductCategorySchema;

  const updateProductCategorySchema = baseProductCategorySchema.extend({
    id: z.string().min(1, messages?.idRequired || "Category ID is required"),
  });

  return { createProductCategorySchema, updateProductCategorySchema };
};

// For client-side with i18n
export const getProductCategorySchemas = (t: (key: string) => string) => {
  return createProductCategorySchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    nameRequired: t("validation.nameRequired"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createProductCategorySchema, updateProductCategorySchema } =
  createProductCategorySchemas();

export { createProductCategorySchema, updateProductCategorySchema };

export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;

