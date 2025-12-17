import { z } from "zod";

// Helper to create schemas with custom messages
const createBankSchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  nameRequired?: string;
  accountNoMax?: string;
  idRequired?: string;
}) => {
  const baseBankSchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    accountNo: z
      .string()
      .max(
        50,
        messages?.accountNoMax ||
          "Account number must be less than 50 characters",
      )
      .trim()
      .optional()
      .or(z.literal("")),
    active: z.boolean(),
  });

  const createBankSchema = baseBankSchema;

  const updateBankSchema = baseBankSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Bank ID is required"),
  });

  return { createBankSchema, updateBankSchema };
};

// For client-side with i18n
export const getBankSchemas = (t: (key: string) => string) => {
  return createBankSchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    nameRequired: t("validation.nameRequired"),
    accountNoMax: t("validation.accountNoMax"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createBankSchema, updateBankSchema } = createBankSchemas();

export { createBankSchema, updateBankSchema };

export type CreateBankInput = z.infer<typeof createBankSchema>;
export type UpdateBankInput = z.infer<typeof updateBankSchema>;
