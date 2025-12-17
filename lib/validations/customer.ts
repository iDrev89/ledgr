import { z } from "zod";

// Helper to create schemas with custom messages
const createCustomerSchemas = (messages?: {
  nameMin?: string;
  nameMax?: string;
  emailInvalid?: string;
  phoneMax?: string;
  docIdMax?: string;
  birthdateInvalid?: string;
  birthdateNotToday?: string;
  noteMax?: string;
  idRequired?: string;
}) => {
  const baseCustomerSchema = z.object({
    name: z
      .string()
      .min(2, messages?.nameMin || "Name must be at least 2 characters")
      .max(100, messages?.nameMax || "Name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .email(messages?.emailInvalid || "Invalid email address")
      .toLowerCase()
      .trim()
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .max(20, messages?.phoneMax || "Phone must be less than 20 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    docId: z
      .string()
      .max(
        50,
        messages?.docIdMax || "Document ID must be less than 50 characters",
      )
      .trim()
      .optional()
      .or(z.literal("")),
    birthdate: z
      .string()
      .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: messages?.birthdateInvalid || "Invalid date format",
      })
      .refine(
        (date) => {
          if (!date) return true;
          const selectedDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate < today;
        },
        {
          message:
            messages?.birthdateNotToday ||
            "Birthdate cannot be today or in the future",
        },
      )
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .max(500, messages?.noteMax || "Note must be less than 500 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  });

  const createCustomerSchema = baseCustomerSchema;

  const updateCustomerSchema = baseCustomerSchema.extend({
    id: z.string().min(1, messages?.idRequired || "Customer ID is required"),
  });

  return { createCustomerSchema, updateCustomerSchema };
};

// For client-side with i18n
export const getCustomerSchemas = (t: (key: string) => string) => {
  return createCustomerSchemas({
    nameMin: t("validation.nameMin"),
    nameMax: t("validation.nameMax"),
    emailInvalid: t("validation.emailInvalid"),
    phoneMax: t("validation.phoneMax"),
    docIdMax: t("validation.docIdMax"),
    birthdateInvalid: t("validation.birthdateInvalid"),
    birthdateNotToday: t("validation.birthdateNotToday"),
    noteMax: t("validation.noteMax"),
    idRequired: t("validation.idRequired"),
  });
};

// For server-side (English fallback)
const { createCustomerSchema, updateCustomerSchema } = createCustomerSchemas();

export { createCustomerSchema, updateCustomerSchema };

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
