import { z } from "zod";

enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  TRANSFER = "TRANSFER",
  DIGITAL = "DIGITAL",
  OTHER = "OTHER",
}

// Helper to create schemas with custom messages
const createExpenseSchemas = (messages?: {
  categoryIdRequired?: string;
  categoryIdInvalid?: string;
  supplierIdInvalid?: string;
  descriptionMax?: string;
  invoiceNoMax?: string;
  amountInvalid?: string;
  amountRequired?: string;
  incurredAtRequired?: string;
  incurredAtInvalid?: string;
  paymentMethodInvalid?: string;
  bankIdRequired?: string;
  referenceMax?: string;
  idRequired?: string;
}) => {
  const baseExpenseSchema = z
    .object({
      categoryId: z
        .string()
        .min(1, messages?.categoryIdRequired || "Category is required"),
      supplierId: z.string().optional().nullable(),
      description: z
        .string()
        .max(
          500,
          messages?.descriptionMax ||
            "Description must be less than 500 characters",
        )
        .trim()
        .optional()
        .or(z.literal("")),
      invoiceNo: z
        .string()
        .max(
          100,
          messages?.invoiceNoMax ||
            "Invoice number must be less than 100 characters",
        )
        .trim()
        .optional()
        .or(z.literal("")),
      amount: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message:
            messages?.amountInvalid || "Amount must be a valid positive number",
        }),
      paymentMethod: z.enum(PaymentMethod, {
        message: messages?.paymentMethodInvalid || "Invalid payment method",
      }),
      bankId: z.string().optional().nullable(),
      reference: z
        .string()
        .max(
          100,
          messages?.referenceMax ||
            "Reference must be less than 100 characters",
        )
        .trim()
        .optional()
        .or(z.literal("")),
      incurredAt: z
        .string()
        .or(z.date())
        .refine(
          (val) => {
            const date = typeof val === "string" ? new Date(val) : val;
            return !isNaN(date.getTime());
          },
          {
            message: messages?.incurredAtInvalid || "Invalid date format",
          },
        ),
    })
    .refine(
      (data) => {
        // If payment method is TRANSFER, bankId is required
        if (data.paymentMethod === PaymentMethod.TRANSFER && !data.bankId) {
          return false;
        }
        return true;
      },
      {
        message: messages?.bankIdRequired || "Bank is required for transfers",
        path: ["bankId"],
      },
    );

  const createExpenseSchema = baseExpenseSchema;

  const updateExpenseSchema = baseExpenseSchema.merge(
    z.object({
      id: z.string().min(1, messages?.idRequired || "Expense ID is required"),
    }),
  );

  return { createExpenseSchema, updateExpenseSchema };
};

// For client-side with i18n
export const getExpenseSchemas = (t: (key: string) => string) => {
  return createExpenseSchemas({
    categoryIdRequired: t("validation.categoryIdRequired"),
    categoryIdInvalid: t("validation.categoryIdInvalid"),
    supplierIdInvalid: t("validation.supplierIdInvalid"),
    descriptionMax: t("validation.descriptionMax"),
    invoiceNoMax: t("validation.invoiceNoMax"),
    amountInvalid: t("validation.amountInvalid"),
    amountRequired: t("validation.amountRequired"),
    paymentMethodInvalid: t("validation.paymentMethodInvalid"),
    bankIdRequired: t("validation.bankIdRequired"),
    referenceMax: t("validation.referenceMax"),
    incurredAtRequired: t("validation.incurredAtRequired"),
    incurredAtInvalid: t("validation.incurredAtInvalid"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createExpenseSchema, updateExpenseSchema } = createExpenseSchemas();

export { createExpenseSchema, updateExpenseSchema };

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
