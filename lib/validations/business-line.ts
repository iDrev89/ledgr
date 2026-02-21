import { z } from "zod";

const createBusinessLineSchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  idRequired?: string;
}) => {
  const baseBusinessLineSchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    code: z.string().max(10).trim().optional().or(z.literal("")),
    color: z.string().max(20).trim().optional().or(z.literal("")),
    active: z.boolean(),
  });

  const createBusinessLineSchema = baseBusinessLineSchema;

  const updateBusinessLineSchema = baseBusinessLineSchema.extend({
    id: z
      .string()
      .min(1, messages?.idRequired || "Business line ID is required"),
  });

  return { createBusinessLineSchema, updateBusinessLineSchema };
};

export const getBusinessLineSchemas = (t: (key: string) => string) => {
  return createBusinessLineSchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    idRequired: t("validation.idRequired"),
  });
};

const { createBusinessLineSchema, updateBusinessLineSchema } =
  createBusinessLineSchemas();

export { createBusinessLineSchema, updateBusinessLineSchema };

export type CreateBusinessLineInput = z.infer<typeof createBusinessLineSchema>;
export type UpdateBusinessLineInput = z.infer<typeof updateBusinessLineSchema>;
