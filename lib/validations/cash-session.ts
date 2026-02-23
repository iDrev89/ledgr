import { z } from "zod";

export const openSessionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  branchId: z.string().nullable().optional(),
  openingBalance: z.number().min(0, "Opening balance must be 0 or greater"),
  openingNotes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const closeSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  actualBalance: z.number().min(0, "Actual balance must be 0 or greater"),
  retainedAmount: z.number().min(0, "Retained amount must be 0 or greater"),
  depositAccountId: z.string().optional().or(z.literal("")),
  closingNotes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type OpenSessionInput = z.infer<typeof openSessionSchema>;
export type CloseSessionInput = z.infer<typeof closeSessionSchema>;
