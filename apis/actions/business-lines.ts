"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createBusinessLineSchema,
  updateBusinessLineSchema,
  type CreateBusinessLineInput,
  type UpdateBusinessLineInput,
} from "@/lib/validations/business-line";
import type { BusinessLine } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type BusinessLineWithRelations = BusinessLine & {
  _count?: {
    products: number;
    sales: number;
    expenses: number;
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

export const getBusinessLines = async (params?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<
  ActionResponse<{ businessLines: BusinessLineWithRelations[]; total: number }>
> => {
  const t = await getTranslations("BusinessLines.errors");

  try {
    await requireAuth();

    const { search = "", activeOnly = false } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (activeOnly) {
      where.active = true;
    }

    const [businessLines, total] = await Promise.all([
      prisma.businessLine.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              products: true,
              sales: true,
              expenses: true,
            },
          },
        },
      }),
      prisma.businessLine.count({ where }),
    ]);

    return { success: true, data: { businessLines, total } };
  } catch (error) {
    console.error("Error fetching business lines:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getBusinessLine = async (
  id: string,
): Promise<ActionResponse<BusinessLineWithRelations>> => {
  const t = await getTranslations("BusinessLines.errors");

  try {
    await requireAuth();

    const businessLine = await prisma.businessLine.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            sales: true,
            expenses: true,
          },
        },
      },
    });

    if (!businessLine) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: businessLine };
  } catch (error) {
    console.error("Error fetching business line:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createBusinessLine = async (
  input: CreateBusinessLineInput,
): Promise<ActionResponse<BusinessLine>> => {
  const t = await getTranslations("BusinessLines.errors");

  try {
    await requireAuth();

    const validated = createBusinessLineSchema.parse(input);

    const existingBusinessLine = await prisma.businessLine.findUnique({
      where: { name: validated.name },
    });

    if (existingBusinessLine) {
      return { success: false, error: t("duplicateName") };
    }

    const businessLine = await prisma.businessLine.create({
      data: {
        name: validated.name,
        code: validated.code || null,
        color: validated.color || null,
        active: validated.active,
      },
    });

    revalidatePath("/business-lines");

    return { success: true, data: businessLine };
  } catch (error) {
    console.error("Error creating business line:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateBusinessLine = async (
  input: UpdateBusinessLineInput,
): Promise<ActionResponse<BusinessLine>> => {
  const t = await getTranslations("BusinessLines.errors");

  try {
    await requireAuth();

    const validated = updateBusinessLineSchema.parse(input);

    const existingBusinessLine = await prisma.businessLine.findUnique({
      where: { id: validated.id },
    });

    if (!existingBusinessLine) {
      return { success: false, error: t("notFound") };
    }

    if (validated.name !== existingBusinessLine.name) {
      const duplicateBusinessLine = await prisma.businessLine.findUnique({
        where: { name: validated.name },
      });

      if (duplicateBusinessLine) {
        return { success: false, error: t("duplicateName") };
      }
    }

    const businessLine = await prisma.businessLine.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        code: validated.code || null,
        color: validated.color || null,
        active: validated.active,
      },
    });

    revalidatePath("/business-lines");

    return { success: true, data: businessLine };
  } catch (error) {
    console.error("Error updating business line:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteBusinessLine = async (
  id: string,
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("BusinessLines.errors");

  try {
    await requireAuth();

    const businessLine = await prisma.businessLine.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            sales: true,
            expenses: true,
          },
        },
      },
    });

    if (!businessLine) {
      return { success: false, error: t("notFound") };
    }

    const totalUsage =
      businessLine._count.products +
      businessLine._count.sales +
      businessLine._count.expenses;

    if (totalUsage > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.businessLine.delete({
      where: { id },
    });

    revalidatePath("/business-lines");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting business line:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};
