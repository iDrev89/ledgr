import { z } from "zod";

export const cashCloseSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  branchId: z.string().optional().nullable(),
  actualBalance: z.coerce.number().min(0, "Balance must be zero or positive"),
  notes: z.string().optional().nullable(),
});

export type CashCloseInput = z.infer<typeof cashCloseSchema>;
