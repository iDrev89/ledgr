import { z } from "zod";
import { PaymentMethod } from "@/prisma/prisma-client";

// Helper to create schemas with custom messages
const createSaleSchemas = (messages?: {
  customerIdRequired?: string;
  itemsRequired?: string;
  itemsMin?: string;
  productIdRequired?: string;
  quantityInvalid?: string;
  quantityMin?: string;
  unitPriceInvalid?: string;
  discountInvalid?: string;
  paymentsRequired?: string;
  paymentMethodRequired?: string;
  paymentAmountInvalid?: string;
  paymentAmountMin?: string;
  paymentsExceedTotal?: string;
  noteMax?: string;
  idRequired?: string;
}) => {
  const saleItemSchema = z.object({
    productId: z
      .string()
      .min(1, messages?.productIdRequired || "Product is required"),
    quantity: z
      .number()
      .int()
      .positive(messages?.quantityMin || "Quantity must be at least 1"),
    unitPrice: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: messages?.unitPriceInvalid || "Unit price must be a valid positive number",
      }),
    discount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: messages?.discountInvalid || "Discount must be a valid positive number",
      })
      .default("0"),
  });

  const salePaymentSchema = z.object({
    amount: z
      .string()
      .min(1, messages?.paymentAmountInvalid || "Payment amount is required")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: messages?.paymentAmountInvalid || "Payment amount must be a valid positive number",
      }),
    method: z.nativeEnum(PaymentMethod, {
      message: messages?.paymentMethodRequired || "Payment method is required",
    }),
    bankId: z
      .string()
      .optional()
      .or(z.literal("")),
    reference: z
      .string()
      .max(100)
      .trim()
      .optional()
      .or(z.literal("")),
  });

  const baseSaleSchema = z.object({
    customerId: z
      .string()
      .min(1, messages?.customerIdRequired || "Customer is required"),
    items: z
      .array(saleItemSchema)
      .min(1, messages?.itemsMin || "At least one item is required"),
    payments: z
      .array(salePaymentSchema)
      .optional()
      .default([]),
    note: z
      .string()
      .max(500, messages?.noteMax || "Note must be less than 500 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  });

  const createSaleSchema = baseSaleSchema;

  const updateSaleSchema = baseSaleSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Sale ID is required"),
  });

  return { createSaleSchema, updateSaleSchema, saleItemSchema, salePaymentSchema };
};

// For client-side with i18n
export const getSaleSchemas = (t: (key: string) => string) => {
  return createSaleSchemas({
    customerIdRequired: t("validation.customerIdRequired"),
    itemsRequired: t("validation.itemsRequired"),
    itemsMin: t("validation.itemsMin"),
    productIdRequired: t("validation.productIdRequired"),
    quantityInvalid: t("validation.quantityInvalid"),
    quantityMin: t("validation.quantityMin"),
    unitPriceInvalid: t("validation.unitPriceInvalid"),
    discountInvalid: t("validation.discountInvalid"),
    paymentsRequired: t("validation.paymentsRequired"),
    paymentMethodRequired: t("validation.paymentMethodRequired"),
    paymentAmountInvalid: t("validation.paymentAmountInvalid"),
    paymentAmountMin: t("validation.paymentAmountMin"),
    paymentsExceedTotal: t("validation.paymentsExceedTotal"),
    noteMax: t("validation.noteMax"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createSaleSchema, updateSaleSchema, saleItemSchema, salePaymentSchema } =
  createSaleSchemas();

export { createSaleSchema, updateSaleSchema, saleItemSchema, salePaymentSchema };

export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type SalePaymentInput = z.infer<typeof salePaymentSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

