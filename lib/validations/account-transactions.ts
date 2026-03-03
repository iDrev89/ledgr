import { z } from "zod";

enum AccountTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUSTMENT = "ADJUSTMENT",
}

const createAccountTransactionSchemas = (messages?: {
  accountIdRequired?: string;
  typeInvalid?: string;
  amountInvalid?: string;
  amountRequired?: string;
  descriptionMax?: string;
  referenceMax?: string;
  transactionDateInvalid?: string;
  relatedAccountIdRequired?: string;
  idRequired?: string;
}) => {
  const baseTransactionSchema = z.object({
    accountId: z
      .string()
      .min(1, messages?.accountIdRequired || "Account is required"),
    type: z.nativeEnum(AccountTransactionType),
    amount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) !== 0, {
        message:
          messages?.amountInvalid || "Amount must be a valid non-zero number",
      }),
    description: z
      .string()
      .max(
        500,
        messages?.descriptionMax ||
          "Description must be less than 500 characters",
      )
      .optional()
      .or(z.literal("")),
    reference: z
      .string()
      .max(
        100,
        messages?.referenceMax || "Reference must be less than 100 characters",
      )
      .optional()
      .or(z.literal("")),
    transactionDate: z
      .string()
      .or(z.date())
      .refine(
        (val) => {
          const date = typeof val === "string" ? new Date(val) : val;
          return !isNaN(date.getTime());
        },
        {
          message: messages?.transactionDateInvalid || "Invalid date",
        },
      ),
  });

  const createTransactionSchema = baseTransactionSchema;

  const updateTransactionSchema = baseTransactionSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Transaction ID is required"),
  });

  const createTransferSchema = z
    .object({
      fromAccountId: z
        .string()
        .min(1, messages?.accountIdRequired || "Source account is required"),
      toAccountId: z
        .string()
        .min(
          1,
          messages?.relatedAccountIdRequired ||
            "Destination account is required",
        ),
      amount: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message:
            messages?.amountInvalid ||
            "Amount must be a valid positive number",
        }),
      description: z
        .string()
        .max(
          500,
          messages?.descriptionMax ||
            "Description must be less than 500 characters",
        )
        .optional()
        .or(z.literal("")),
      reference: z
        .string()
        .max(
          100,
          messages?.referenceMax ||
            "Reference must be less than 100 characters",
        )
        .optional()
        .or(z.literal("")),
      transactionDate: z
        .string()
        .or(z.date())
        .refine(
          (val) => {
            const date = typeof val === "string" ? new Date(val) : val;
            return !isNaN(date.getTime());
          },
          {
            message: messages?.transactionDateInvalid || "Invalid date",
          },
        ),
    })
    .refine((data) => data.fromAccountId !== data.toAccountId, {
      message: "Source and destination accounts must be different",
      path: ["toAccountId"],
    });

  return {
    createTransactionSchema,
    updateTransactionSchema,
    createTransferSchema,
  };
};

export const getAccountTransactionSchemas = (t: (key: string) => string) => {
  return createAccountTransactionSchemas({
    accountIdRequired: t("validation.accountIdRequired"),
    typeInvalid: t("validation.typeInvalid"),
    amountInvalid: t("validation.amountInvalid"),
    amountRequired: t("validation.amountRequired"),
    descriptionMax: t("validation.descriptionMax"),
    referenceMax: t("validation.referenceMax"),
    transactionDateInvalid: t("validation.transactionDateInvalid"),
    relatedAccountIdRequired: t("validation.relatedAccountIdRequired"),
    idRequired: t("validation.idRequired"),
  });
};

const {
  createTransactionSchema,
  updateTransactionSchema,
  createTransferSchema,
} = createAccountTransactionSchemas();

export {
  createTransactionSchema,
  updateTransactionSchema,
  createTransferSchema,
};

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
