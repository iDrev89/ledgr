import { z } from "zod";
import { UserRole } from "@/lib/constants";

/**
 * Schema validation for user forms
 */

// Base user schema with common fields
const baseUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  role: z.nativeEnum(UserRole),
});

// Schema for creating a new user
export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// Schema for updating a user
export const updateUserSchema = baseUserSchema.extend({
  banned: z.boolean().optional(),
});

// Schema for banning a user
export const banUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  banReason: z
    .string()
    .min(3, "Ban reason must be at least 3 characters")
    .max(500, "Ban reason must be less than 500 characters")
    .trim(),
  banExpiresIn: z
    .number()
    .positive("Ban duration must be positive")
    .optional(),
});

// TypeScript types inferred from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;

