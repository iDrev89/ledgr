import { z } from "zod";

// Helper to create schemas with custom messages
const createExpenseCategorySchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  nameRequired?: string;
  idRequired?: string;
}) => {
  const baseExpenseCategorySchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    active: z.boolean().default(true),
  });

  const createExpenseCategorySchema = baseExpenseCategorySchema;

  const updateExpenseCategorySchema = baseExpenseCategorySchema.extend({
    id: z.string().min(1, messages?.idRequired || "Category ID is required"),
  });

  return { createExpenseCategorySchema, updateExpenseCategorySchema };
};

// For client-side with i18n
export const getExpenseCategorySchemas = (t: (key: string) => string) => {
  return createExpenseCategorySchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    nameRequired: t("validation.nameRequired"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createExpenseCategorySchema, updateExpenseCategorySchema } =
  createExpenseCategorySchemas();

export { createExpenseCategorySchema, updateExpenseCategorySchema };

export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;

