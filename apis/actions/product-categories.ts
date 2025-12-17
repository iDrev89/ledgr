"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
  type CreateProductCategoryInput,
  type UpdateProductCategoryInput,
} from "@/lib/validations/product-categories";
import type { ProductCategoryWithRelations } from "@/lib/types/product-categories";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

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

export const getProductCategories = async (params?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<ActionResponse<ProductCategoryWithRelations[]>> => {
  const t = await getTranslations("ProductCategories.errors");

  try {
    await requireAuth();

    const { search = "", activeOnly = true } = params || {};

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" as const };
    }

    if (activeOnly) {
      where.active = true;
    }

    const categories = await prisma.productCategory.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getProductCategory = async (
  id: string,
): Promise<ActionResponse<ProductCategoryWithRelations>> => {
  const t = await getTranslations("ProductCategories.errors");

  try {
    await requireAuth();

    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching product category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createProductCategory = async (
  input: CreateProductCategoryInput,
): Promise<ActionResponse<ProductCategoryWithRelations>> => {
  const t = await getTranslations("ProductCategories.errors");

  try {
    await requireAuth();

    const validated = createProductCategorySchema.parse(input);

    // Check if category name already exists
    const existing = await prisma.productCategory.findFirst({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: t("nameExists") };
    }

    const category = await prisma.productCategory.create({
      data: {
        name: validated.name,
        active: validated.active,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/products");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating product category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateProductCategory = async (
  input: UpdateProductCategoryInput,
): Promise<ActionResponse<ProductCategoryWithRelations>> => {
  const t = await getTranslations("ProductCategories.errors");

  try {
    await requireAuth();

    const validated = updateProductCategorySchema.parse(input);

    // Check if category exists
    const existing = await prisma.productCategory.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    // Check if new name already exists (excluding current category)
    const nameExists = await prisma.productCategory.findFirst({
      where: {
        name: validated.name,
        id: { not: validated.id },
      },
    });

    if (nameExists) {
      return { success: false, error: t("nameExists") };
    }

    const category = await prisma.productCategory.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        active: validated.active,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/products");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating product category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteProductCategory = async (
  id: string,
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("ProductCategories.errors");

  try {
    await requireAuth();

    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      return { success: false, error: t("notFound") };
    }

    // Check if category has products
    if (category.products.length > 0) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.productCategory.delete({
      where: { id },
    });

    revalidatePath("/products");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting product category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};
