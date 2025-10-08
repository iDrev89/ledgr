import { z } from "zod";

export const getCustomerSchemas = (t: (key: string) => string) => {
  const baseCustomerSchema = z.object({
    name: z
      .string()
      .min(2, t("validation.nameMin"))
      .max(100, t("validation.nameMax"))
      .trim(),
    email: z
      .string()
      .email(t("validation.emailInvalid"))
      .toLowerCase()
      .trim()
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .max(20, t("validation.phoneMax"))
      .trim()
      .optional()
      .or(z.literal("")),
    docId: z
      .string()
      .max(50, t("validation.docIdMax"))
      .trim()
      .optional()
      .or(z.literal("")),
    birthdate: z
      .string()
      .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: t("validation.birthdateInvalid"),
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
          message: t("validation.birthdateNotToday"),
        }
      )
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .max(500, t("validation.noteMax"))
      .trim()
      .optional()
      .or(z.literal("")),
  });

  const createCustomerSchema = baseCustomerSchema;

  const updateCustomerSchema = baseCustomerSchema.extend({
    id: z.string().min(1, t("validation.idRequired")),
  });

  return { createCustomerSchema, updateCustomerSchema };
};

// Default schemas for server-side validation (English fallback)
const baseCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Phone must be less than 20 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  docId: z
    .string()
    .max(50, "Document ID must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  birthdate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: "Invalid date format",
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
        message: "Birthdate cannot be today or in the future",
      }
    )
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Note must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const createCustomerSchema = baseCustomerSchema;

export const updateCustomerSchema = baseCustomerSchema.extend({
  id: z.string().min(1, "Customer ID is required"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
