import { z } from "zod";

export const createReconciliationSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  statementBalance: z.coerce.number(),
  notes: z.string().optional().nullable(),
});

export const updateReconciliationItemSchema = z.object({
  id: z.string(),
  status: z.enum(["MATCHED", "UNMATCHED", "CREATED", "IGNORED"]),
  transactionId: z.string().optional().nullable(),
});

export const importStatementSchema = z.object({
  reconciliationId: z.string().min(1),
  items: z.array(
    z.object({
      externalRef: z.string().optional().nullable(),
      externalAmount: z.coerce.number(),
      externalDate: z.coerce.date(),
    })
  ),
});

export type CreateReconciliationInput = z.infer<
  typeof createReconciliationSchema
>;
export type UpdateReconciliationItemInput = z.infer<
  typeof updateReconciliationItemSchema
>;
export type ImportStatementInput = z.infer<typeof importStatementSchema>;
