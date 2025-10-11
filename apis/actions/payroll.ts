"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createPayrollRunSchema,
  createPayrollEntrySchema,
  type CreatePayrollRunInput,
  type CreatePayrollEntryInput,
} from "@/lib/validations/payroll";
import type {
  PayrollRun,
  PayrollRunItem,
  PayrollEntry,
} from "@/prisma/prisma-client";
import { Decimal } from "@prisma/client/runtime/library";
import type {
  PayrollRunWithDetails,
  PayrollRunItemWithDetails,
  PayrollEntryWithDetails,
} from "@/lib/types/payroll";
import {
  PayrollRunStatus,
  PayrollEntryKind,
  ProductType,
} from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Serialize Decimal fields to strings for client components
const serializePayrollRun = (run: any): PayrollRunWithDetails => {
  return {
    ...run,
    startDate: run.startDate.toISOString(),
    endDate: run.endDate.toISOString(),
    items: run.items
      ? run.items.map((item: any) => ({
          ...item,
          commissionsTotal: item.commissionsTotal.toString(),
          advancesTotal: item.advancesTotal.toString(),
          adjustmentsTotal: item.adjustmentsTotal.toString(),
          salaryFixed: item.salaryFixed ? item.salaryFixed.toString() : null,
          payableTotal: item.payableTotal.toString(),
          paidAmount: item.paidAmount.toString(),
          balance: item.balance.toString(),
          user: item.user
            ? {
                id: item.user.id,
                name: item.user.name,
                email: item.user.email,
              }
            : undefined,
        }))
      : [],
    entries: run.entries
      ? run.entries.map((entry: any) => ({
          ...entry,
          amount: entry.amount.toString(),
          user: entry.user
            ? {
                id: entry.user.id,
                name: entry.user.name,
                email: entry.user.email,
              }
            : undefined,
        }))
      : [],
  };
};

const serializePayrollEntry = (entry: any): PayrollEntryWithDetails => {
  return {
    ...entry,
    amount: entry.amount.toString(),
    user: entry.user
      ? {
          id: entry.user.id,
          name: entry.user.name,
          email: entry.user.email,
        }
      : undefined,
    run: entry.run || null,
    commissionEntries: entry.commissionEntries || [],
  };
};

const requireAuth = async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
};

// ==================== PAYROLL RUNS ====================

export const getPayrollRuns = async (params?: {
  status?: PayrollRunStatus;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ runs: PayrollRunWithDetails[]; total: number }>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const { status, limit = 50, offset = 0 } = params || {};

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [runs, total] = await Promise.all([
      prisma.payrollRun.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { startDate: "desc" },
        include: {
          items: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          entries: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.payrollRun.count({ where }),
    ]);

    const serializedRuns = runs.map(serializePayrollRun);

    return { success: true, data: { runs: serializedRuns, total } };
  } catch (error) {
    console.error("Error fetching payroll runs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getPayrollRun = async (
  id: string
): Promise<ActionResponse<PayrollRunWithDetails>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        entries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!run) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializePayrollRun(run) };
  } catch (error) {
    console.error("Error fetching payroll run:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createPayrollRun = async (
  input: CreatePayrollRunInput & { userIds?: string[] }
): Promise<ActionResponse<PayrollRunWithDetails>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const validated = createPayrollRunSchema.parse(input);

    const startDate = new Date(validated.startDate);
    const endDate = new Date(validated.endDate);

    // Get all sale items with commissions in the period
    const saleItemsWithCommissions = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        performedById: input.userIds ? { in: input.userIds } : { not: null },
        commissionPercentApplied: { not: null },
        product: {
          type: ProductType.SERVICE,
        },
      },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: true,
        sale: true,
      },
    });

    // Group by user and calculate commissions
    const userCommissions = new Map<
      string,
      {
        user: { id: string; name: string; email: string };
        total: Decimal;
        saleItemIds: string[];
      }
    >();

    for (const item of saleItemsWithCommissions) {
      if (!item.performedById || !item.performedBy) continue;

      const percent = item.commissionPercentApplied || new Decimal(0);
      const base = item.lineTotal;
      const commission = base.times(percent).div(100);

      const existing = userCommissions.get(item.performedById);
      if (existing) {
        existing.total = existing.total.plus(commission);
        existing.saleItemIds.push(item.id);
      } else {
        userCommissions.set(item.performedById, {
          user: item.performedBy,
          total: commission,
          saleItemIds: [item.id],
        });
      }
    }

    // Get advances and adjustments for users in the period
    const userAdvancesAndAdjustments = new Map<
      string,
      { advances: Decimal; adjustments: Decimal; entryIds: string[] }
    >();

    const entries = await prisma.payrollEntry.findMany({
      where: {
        userId: input.userIds ? { in: input.userIds } : undefined,
        kind: { in: [PayrollEntryKind.ADVANCE, PayrollEntryKind.ADJUSTMENT] },
        period: validated.periodLabel,
        runId: null, // Only unassigned entries
      },
    });

    for (const entry of entries) {
      const existing = userAdvancesAndAdjustments.get(entry.userId);
      if (entry.kind === PayrollEntryKind.ADVANCE) {
        if (existing) {
          existing.advances = existing.advances.plus(entry.amount);
          existing.entryIds.push(entry.id);
        } else {
          userAdvancesAndAdjustments.set(entry.userId, {
            advances: entry.amount,
            adjustments: new Decimal(0),
            entryIds: [entry.id],
          });
        }
      } else if (entry.kind === PayrollEntryKind.ADJUSTMENT) {
        if (existing) {
          existing.adjustments = existing.adjustments.plus(entry.amount);
          existing.entryIds.push(entry.id);
        } else {
          userAdvancesAndAdjustments.set(entry.userId, {
            advances: new Decimal(0),
            adjustments: entry.amount,
            entryIds: [entry.id],
          });
        }
      }
    }

    // Create PayrollRun with items
    const run = await prisma.$transaction(async (tx) => {
      const newRun = await tx.payrollRun.create({
        data: {
          periodType: validated.periodType,
          periodLabel: validated.periodLabel,
          startDate,
          endDate,
          status: PayrollRunStatus.DRAFT,
        },
      });

      // Create items for each user
      const itemsData: any[] = [];
      for (const [userId, commissionData] of userCommissions.entries()) {
        const advAdjData = userAdvancesAndAdjustments.get(userId);
        const commissionsTotal = commissionData.total;
        const advancesTotal = advAdjData ? advAdjData.advances : new Decimal(0);
        const adjustmentsTotal = advAdjData ? advAdjData.adjustments : new Decimal(0);
        const payableTotal = commissionsTotal
          .minus(advancesTotal)
          .plus(adjustmentsTotal);

        itemsData.push({
          runId: newRun.id,
          userId,
          commissionsTotal,
          advancesTotal,
          adjustmentsTotal,
          payableTotal,
          balance: payableTotal,
        });
      }

      if (itemsData.length > 0) {
        await tx.payrollRunItem.createMany({
          data: itemsData,
        });
      }

      // Link advances and adjustments to this run
      for (const entry of entries) {
        await tx.payrollEntry.update({
          where: { id: entry.id },
          data: { runId: newRun.id },
        });
      }

      return tx.payrollRun.findUnique({
        where: { id: newRun.id },
        include: {
          items: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          entries: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    if (!run) {
      throw new Error("Failed to create payroll run");
    }

    revalidatePath("/payroll");

    return { success: true, data: serializePayrollRun(run) };
  } catch (error) {
    console.error("Error creating payroll run:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const finalizePayrollRun = async (
  id: string
): Promise<ActionResponse<PayrollRunWithDetails>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!run) {
      return { success: false, error: t("notFound") };
    }

    if (run.status !== PayrollRunStatus.DRAFT) {
      return { success: false, error: t("cannotFinalize") };
    }

    // Finalize: create COMMISSION entries for each user
    const updatedRun = await prisma.$transaction(async (tx) => {
      for (const item of run.items) {
        if (item.commissionsTotal.gt(0)) {
          await tx.payrollEntry.create({
            data: {
              userId: item.userId,
              kind: PayrollEntryKind.COMMISSION,
              amount: item.commissionsTotal,
              period: run.periodLabel,
              runId: run.id,
              description: `Comisiones ${run.periodLabel}`,
            },
          });
        }
      }

      await tx.payrollRun.update({
        where: { id },
        data: { status: PayrollRunStatus.FINALIZED },
      });

      return tx.payrollRun.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          entries: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updatedRun) {
      throw new Error("Failed to finalize payroll run");
    }

    revalidatePath("/payroll");
    revalidatePath(`/payroll/${id}`);

    return { success: true, data: serializePayrollRun(updatedRun) };
  } catch (error) {
    console.error("Error finalizing payroll run:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("finalizeFailed"),
    };
  }
};

export const payPayrollRun = async (
  id: string,
  payments: { userId: string; amount: string }[]
): Promise<ActionResponse<PayrollRunWithDetails>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!run) {
      return { success: false, error: t("notFound") };
    }

    if (run.status !== PayrollRunStatus.FINALIZED) {
      return { success: false, error: t("cannotPay") };
    }

    // Process payments
    const updatedRun = await prisma.$transaction(async (tx) => {
      for (const payment of payments) {
        const amount = new Decimal(payment.amount);

        // Create PAYMENT entry
        await tx.payrollEntry.create({
          data: {
            userId: payment.userId,
            kind: PayrollEntryKind.PAYMENT,
            amount: amount.negated(), // Negative for payment
            period: run.periodLabel,
            runId: run.id,
            description: `Pago ${run.periodLabel}`,
          },
        });

        // Update item balance
        const item = run.items.find((i) => i.userId === payment.userId);
        if (item) {
          const newPaidAmount = item.paidAmount.plus(amount);
          const newBalance = item.balance.minus(amount);

          await tx.payrollRunItem.update({
            where: { id: item.id },
            data: {
              paidAmount: newPaidAmount,
              balance: newBalance,
            },
          });
        }
      }

      // Check if all items are fully paid
      const updatedItems = await tx.payrollRunItem.findMany({
        where: { runId: id },
      });

      const allPaid = updatedItems.every((item) => item.balance.lte(0));

      if (allPaid) {
        await tx.payrollRun.update({
          where: { id },
          data: { status: PayrollRunStatus.PAID },
        });
      }

      return tx.payrollRun.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          entries: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updatedRun) {
      throw new Error("Failed to process payments");
    }

    revalidatePath("/payroll");
    revalidatePath(`/payroll/${id}`);

    return { success: true, data: serializePayrollRun(updatedRun) };
  } catch (error) {
    console.error("Error processing payments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("payFailed"),
    };
  }
};

export const deletePayrollRun = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const run = await prisma.payrollRun.findUnique({
      where: { id },
    });

    if (!run) {
      return { success: false, error: t("notFound") };
    }

    if (run.status !== PayrollRunStatus.DRAFT) {
      return { success: false, error: t("cannotDelete") };
    }

    await prisma.$transaction(async (tx) => {
      // Unlink entries
      await tx.payrollEntry.updateMany({
        where: { runId: id },
        data: { runId: null },
      });

      // Delete items and run
      await tx.payrollRunItem.deleteMany({
        where: { runId: id },
      });

      await tx.payrollRun.delete({
        where: { id },
      });
    });

    revalidatePath("/payroll");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting payroll run:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

// ==================== PAYROLL ENTRIES ====================

export const getPayrollEntries = async (params?: {
  userId?: string;
  kind?: PayrollEntryKind;
  period?: string;
  runId?: string;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResponse<{ entries: PayrollEntryWithDetails[]; total: number }>
> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const {
      userId,
      kind,
      period,
      runId,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (kind) {
      where.kind = kind;
    }

    if (period) {
      where.period = period;
    }

    if (runId !== undefined) {
      where.runId = runId;
    }

    const [entries, total] = await Promise.all([
      prisma.payrollEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          run: true,
        },
      }),
      prisma.payrollEntry.count({ where }),
    ]);

    const serializedEntries = entries.map(serializePayrollEntry);

    return { success: true, data: { entries: serializedEntries, total } };
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createPayrollEntry = async (
  input: CreatePayrollEntryInput
): Promise<ActionResponse<PayrollEntryWithDetails>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const validated = createPayrollEntrySchema.parse(input);

    const entry = await prisma.payrollEntry.create({
      data: {
        userId: validated.userId,
        kind: validated.kind,
        amount: new Decimal(validated.amount),
        period: validated.period,
        description: validated.description || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        run: true,
      },
    });

    revalidatePath("/payroll");

    return { success: true, data: serializePayrollEntry(entry) };
  } catch (error) {
    console.error("Error creating payroll entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const deletePayrollEntry = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Payroll.errors");

  try {
    await requireAuth();

    const entry = await prisma.payrollEntry.findUnique({
      where: { id },
      include: { run: true },
    });

    if (!entry) {
      return { success: false, error: t("notFound") };
    }

    // Only allow deletion of ADVANCE and ADJUSTMENT entries that are not finalized
    if (
      entry.kind !== PayrollEntryKind.ADVANCE &&
      entry.kind !== PayrollEntryKind.ADJUSTMENT
    ) {
      return { success: false, error: t("cannotDeleteEntry") };
    }

    if (entry.run && entry.run.status !== PayrollRunStatus.DRAFT) {
      return { success: false, error: t("cannotDeleteEntry") };
    }

    await prisma.payrollEntry.delete({
      where: { id },
    });

    revalidatePath("/payroll");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting payroll entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

