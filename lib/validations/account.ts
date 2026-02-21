import { z } from "zod";
import { AccountType } from "@/prisma/prisma-client";

const createAccountSchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  nameRequired?: string;
  accountNumberMax?: string;
  typeRequired?: string;
  idRequired?: string;
}) => {
  const baseAccountSchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    type: z.nativeEnum(AccountType, {
      message: messages?.typeRequired || "Account type is required",
    }),
    accountNumber: z
      .string()
      .max(
        50,
        messages?.accountNumberMax ||
          "Account number must be less than 50 characters",
      )
      .trim()
      .optional()
      .or(z.literal("")),
    institution: z.string().max(100).trim().optional().or(z.literal("")),
    initialBalance: z.string().optional().default("0"),
    isDefault: z.boolean().optional().default(false),
    active: z.boolean(),
  });

  const createAccountSchema = baseAccountSchema;

  const updateAccountSchema = baseAccountSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Account ID is required"),
  });

  return { createAccountSchema, updateAccountSchema };
};

export const getAccountSchemas = (t: (key: string) => string) => {
  return createAccountSchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    nameRequired: t("validation.nameRequired"),
    accountNumberMax: t("validation.accountNumberMax"),
    typeRequired: t("validation.typeRequired"),
    idRequired: t("validation.idRequired"),
  });
};

const { createAccountSchema, updateAccountSchema } = createAccountSchemas();

export { createAccountSchema, updateAccountSchema };

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
