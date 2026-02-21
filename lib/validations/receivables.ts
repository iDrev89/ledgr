import { z } from "zod";
import { PaymentMethod } from "@/prisma/prisma-client";

const createReceivableSchemas = (messages?: {
  customerIdRequired?: string;
  amountInvalid?: string;
  amountMin?: string;
  paymentMethodRequired?: string;
  accountIdRequired?: string;
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
    accountId: z
      .string()
      .min(1, messages?.accountIdRequired || "Account is required"),
    note: z.string().max(500).trim().optional().or(z.literal("")),
  });

  const createReceivablePaymentSchema = receivablePaymentSchema.extend({
    receivableId: z
      .string()
      .min(1, messages?.idRequired || "Receivable ID is required"),
  });

  return { receivablePaymentSchema, createReceivablePaymentSchema };
};

export const getReceivableSchemas = (t: (key: string) => string) => {
  return createReceivableSchemas({
    customerIdRequired: t("validation.customerIdRequired"),
    amountInvalid: t("validation.amountInvalid"),
    amountMin: t("validation.amountMin"),
    paymentMethodRequired: t("validation.paymentMethodRequired"),
    accountIdRequired: t("validation.accountIdRequired"),
    idRequired: t("validation.idRequired"),
  });
};

const { receivablePaymentSchema, createReceivablePaymentSchema } =
  createReceivableSchemas();

export { receivablePaymentSchema, createReceivablePaymentSchema };

export type ReceivablePaymentInput = z.infer<typeof receivablePaymentSchema>;
export type CreateReceivablePaymentInput = z.infer<
  typeof createReceivablePaymentSchema
>;
