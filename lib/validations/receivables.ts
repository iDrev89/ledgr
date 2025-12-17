import { z } from "zod";
import { PaymentMethod } from "@/prisma/prisma-client";

// Helper to create schemas with custom messages
const createReceivableSchemas = (messages?: {
  customerIdRequired?: string;
  amountInvalid?: string;
  amountMin?: string;
  paymentMethodRequired?: string;
  idRequired?: string;
}) => {
  const receivablePaymentSchema = z.object({
    amount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message:
          messages?.amountInvalid ||
          "Payment amount must be a valid positive number",
      }),
    method: z.nativeEnum(PaymentMethod, {
      message: messages?.paymentMethodRequired || "Payment method is required",
    }),
    bankId: z.string().optional().or(z.literal("")),
    note: z.string().max(500).trim().optional().or(z.literal("")),
  });

  const createReceivablePaymentSchema = receivablePaymentSchema.extend({
    receivableId: z
      .string()
      .min(1, messages?.idRequired || "Receivable ID is required"),
  });

  return { receivablePaymentSchema, createReceivablePaymentSchema };
};

// For client-side with i18n
export const getReceivableSchemas = (t: (key: string) => string) => {
  return createReceivableSchemas({
    customerIdRequired: t("validation.customerIdRequired"),
    amountInvalid: t("validation.amountInvalid"),
    amountMin: t("validation.amountMin"),
    paymentMethodRequired: t("validation.paymentMethodRequired"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { receivablePaymentSchema, createReceivablePaymentSchema } =
  createReceivableSchemas();

export { receivablePaymentSchema, createReceivablePaymentSchema };

export type ReceivablePaymentInput = z.infer<typeof receivablePaymentSchema>;
export type CreateReceivablePaymentInput = z.infer<
  typeof createReceivablePaymentSchema
>;
