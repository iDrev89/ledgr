import { z } from "zod";

// Definir el enum localmente para evitar problemas de importación
enum BankTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUSTMENT = "ADJUSTMENT",
}

// Helper to create schemas with custom messages
const createBankTransactionSchemas = (messages?: {
  bankIdRequired?: string;
  typeInvalid?: string;
  amountInvalid?: string;
  amountRequired?: string;
  descriptionMax?: string;
  referenceMax?: string;
  transactionDateInvalid?: string;
  relatedBankIdRequired?: string;
  idRequired?: string;
}) => {
  const baseTransactionSchema = z.object({
    bankId: z.string().min(1, messages?.bankIdRequired || "Bank is required"),
    type: z.enum(BankTransactionType, {
      message: messages?.typeInvalid || "Invalid transaction type",
    }),
    amount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) !== 0, {
        message: messages?.amountInvalid || "Amount must be a valid non-zero number",
      }),
    description: z
      .string()
      .max(500, messages?.descriptionMax || "Description must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    reference: z
      .string()
      .max(100, messages?.referenceMax || "Reference must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    transactionDate: z.coerce.date(),
  });

  const createTransactionSchema = baseTransactionSchema;

  const updateTransactionSchema = baseTransactionSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Transaction ID is required"),
  });

  const createTransferSchema = z.object({
    fromBankId: z.string().min(1, messages?.bankIdRequired || "Source bank is required"),
    toBankId: z.string().min(1, messages?.relatedBankIdRequired || "Destination bank is required"),
    amount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: messages?.amountInvalid || "Amount must be a valid positive number",
      }),
    description: z
      .string()
      .max(500, messages?.descriptionMax || "Description must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    reference: z
      .string()
      .max(100, messages?.referenceMax || "Reference must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    transactionDate: z.coerce.date(),
  }).refine((data) => data.fromBankId !== data.toBankId, {
    message: "Source and destination banks must be different",
    path: ["toBankId"],
  });

  return { createTransactionSchema, updateTransactionSchema, createTransferSchema };
};

// For client-side with i18n
export const getBankTransactionSchemas = (t: (key: string) => string) => {
  return createBankTransactionSchemas({
    bankIdRequired: t("validation.bankIdRequired"),
    typeInvalid: t("validation.typeInvalid"),
    amountInvalid: t("validation.amountInvalid"),
    amountRequired: t("validation.amountRequired"),
    descriptionMax: t("validation.descriptionMax"),
    referenceMax: t("validation.referenceMax"),
    transactionDateInvalid: t("validation.transactionDateInvalid"),
    relatedBankIdRequired: t("validation.relatedBankIdRequired"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createTransactionSchema, updateTransactionSchema, createTransferSchema } =
  createBankTransactionSchemas();

export { createTransactionSchema, updateTransactionSchema, createTransferSchema };

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;

