import { z } from "zod";
import {
  PayrollPeriodType,
  PayrollEntryKind,
  PaymentMethod,
} from "@/prisma/prisma-client";

// Helper to create schemas with custom messages
const createPayrollSchemas = (messages?: {
  periodTypeRequired?: string;
  periodLabelRequired?: string;
  periodLabelMax?: string;
  startDateRequired?: string;
  endDateRequired?: string;
  endDateAfterStart?: string;
  userIdsRequired?: string;
  userIdsMin?: string;
  kindRequired?: string;
  amountInvalid?: string;
  amountMin?: string;
  descriptionMax?: string;
  paymentMethodRequired?: string;
  idRequired?: string;
  runIdRequired?: string;
  userIdRequired?: string;
}) => {
  const createPayrollRunSchema = z
    .object({
      periodType: z.nativeEnum(PayrollPeriodType, {
        message: messages?.periodTypeRequired || "Period type is required",
      }),
      periodLabel: z
        .string()
        .min(1, messages?.periodLabelRequired || "Period label is required")
        .max(
          100,
          messages?.periodLabelMax ||
            "Period label must be less than 100 characters",
        )
        .trim(),
      startDate: z
        .string()
        .min(1, messages?.startDateRequired || "Start date is required"),
      endDate: z
        .string()
        .min(1, messages?.endDateRequired || "End date is required"),
      userIds: z.array(z.string()).optional().or(z.literal(undefined)),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
      message:
        messages?.endDateAfterStart || "End date must be after start date",
      path: ["endDate"],
    });

  const finalizePayrollRunSchema = z.object({
    id: z.string().min(1, messages?.idRequired || "Payroll run ID is required"),
  });

  const createPayrollPaymentSchema = z.object({
    runId: z
      .string()
      .min(1, messages?.runIdRequired || "Payroll run ID is required"),
    userId: z
      .string()
      .min(1, messages?.userIdRequired || "User ID is required"),
    amount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message:
          messages?.amountInvalid || "Amount must be a valid positive number",
      }),
    method: z.nativeEnum(PaymentMethod, {
      message: messages?.paymentMethodRequired || "Payment method is required",
    }),
    bankId: z.string().optional().or(z.literal("")),
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
  });

  const createPayrollEntrySchema = z.object({
    userId: z
      .string()
      .min(1, messages?.userIdRequired || "User ID is required"),
    kind: z.nativeEnum(PayrollEntryKind, {
      message: messages?.kindRequired || "Entry kind is required",
    }),
    amount: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) !== 0, {
        message:
          messages?.amountInvalid || "Amount must be a valid non-zero number",
      }),
    period: z
      .string()
      .min(1, messages?.periodLabelRequired || "Period is required")
      .max(50)
      .trim(),
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
  });

  return {
    createPayrollRunSchema,
    finalizePayrollRunSchema,
    createPayrollPaymentSchema,
    createPayrollEntrySchema,
  };
};

// For client-side with i18n
export const getPayrollSchemas = (t: (key: string) => string) => {
  return createPayrollSchemas({
    periodTypeRequired: t("validation.periodTypeRequired"),
    periodLabelRequired: t("validation.periodLabelRequired"),
    periodLabelMax: t("validation.periodLabelMax"),
    startDateRequired: t("validation.startDateRequired"),
    endDateRequired: t("validation.endDateRequired"),
    endDateAfterStart: t("validation.endDateAfterStart"),
    userIdsRequired: t("validation.userIdsRequired"),
    userIdsMin: t("validation.userIdsMin"),
    kindRequired: t("validation.kindRequired"),
    amountInvalid: t("validation.amountInvalid"),
    amountMin: t("validation.amountMin"),
    descriptionMax: t("validation.descriptionMax"),
    paymentMethodRequired: t("validation.paymentMethodRequired"),
    idRequired: t("validation.idRequired"),
    runIdRequired: t("validation.runIdRequired"),
    userIdRequired: t("validation.userIdRequired"),
  });
};

// For server-side (English fallback)
const {
  createPayrollRunSchema,
  finalizePayrollRunSchema,
  createPayrollPaymentSchema,
  createPayrollEntrySchema,
} = createPayrollSchemas();

export {
  createPayrollRunSchema,
  finalizePayrollRunSchema,
  createPayrollPaymentSchema,
  createPayrollEntrySchema,
};

export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;
export type FinalizePayrollRunInput = z.infer<typeof finalizePayrollRunSchema>;
export type CreatePayrollPaymentInput = z.infer<
  typeof createPayrollPaymentSchema
>;
export type CreatePayrollEntryInput = z.infer<typeof createPayrollEntrySchema>;
