import { z } from "zod";

const createBranchSchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  idRequired?: string;
}) => {
  const baseBranchSchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    code: z.string().max(10).trim().optional().or(z.literal("")),
    address: z.string().max(300).trim().optional().or(z.literal("")),
    phone: z.string().max(30).trim().optional().or(z.literal("")),
    active: z.boolean(),
  });

  const createBranchSchema = baseBranchSchema;

  const updateBranchSchema = baseBranchSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Branch ID is required"),
  });

  return { createBranchSchema, updateBranchSchema };
};

export const getBranchSchemas = (t: (key: string) => string) => {
  return createBranchSchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    idRequired: t("validation.idRequired"),
  });
};

const { createBranchSchema, updateBranchSchema } = createBranchSchemas();

export { createBranchSchema, updateBranchSchema };

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
