import { z } from "zod";
import { PaymentMethod } from "@/prisma/prisma-client";

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
  accountIdRequired?: string;
  referenceMax?: string;
  idRequired?: string;
}) => {
  const baseExpenseSchema = z.object({
    categoryId: z
      .string()
      .min(1, messages?.categoryIdRequired || "Category is required"),
    supplierId: z.string().optional().nullable(),
    branchId: z.string().optional().nullable(),
    businessLineId: z.string().optional().nullable(),
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
    paymentMethod: z.nativeEnum(PaymentMethod, {
      message: messages?.paymentMethodInvalid || "Invalid payment method",
    }),
    accountId: z
      .string()
      .min(1, messages?.accountIdRequired || "Account is required"),
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
    attachment: z.string().optional().nullable(),
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
  });

  const createExpenseSchema = baseExpenseSchema;

  const updateExpenseSchema = baseExpenseSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Expense ID is required"),
  });

  return { createExpenseSchema, updateExpenseSchema };
};

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
    accountIdRequired: t("validation.accountIdRequired"),
    referenceMax: t("validation.referenceMax"),
    incurredAtRequired: t("validation.incurredAtRequired"),
    incurredAtInvalid: t("validation.incurredAtInvalid"),
    idRequired: t("validation.idRequired"),
  });
};

const { createExpenseSchema, updateExpenseSchema } = createExpenseSchemas();

export { createExpenseSchema, updateExpenseSchema };

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
