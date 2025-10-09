"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/validations/product";
import type { Product } from "@/prisma/prisma-client";
import { Decimal } from "@prisma/client/runtime/library";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Serialize Decimal fields to strings for client components
const serializeProduct = (product: Product): Product => {
  return {
    ...product,
    price: product.price.toString() as any,
    cost: product.cost ? (product.cost.toString() as any) : null,
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

export const getProducts = async (params?: {
  search?: string;
  type?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ products: Product[]; total: number }>> => {
  const t = await getTranslations("Products.errors");
  
  try {
    await requireAuth();

    const {
      search = "",
      type,
      active,
      limit = 50,
      offset = 0,
    } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    // Serialize Decimal fields to strings
    const serializedProducts = products.map(serializeProduct);

    return { success: true, data: { products: serializedProducts, total } };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const getProduct = async (
  id: string
): Promise<ActionResponse<Product>> => {
  const t = await getTranslations("Products.errors");
  
  try {
    await requireAuth();

    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("fetchFailed"),
    };
  }
};

export const createProduct = async (
  input: CreateProductInput
): Promise<ActionResponse<Product>> => {
  const t = await getTranslations("Products.errors");
  
  try {
    await requireAuth();

    const validated = createProductSchema.parse(input);

    // Check if SKU already exists (if provided)
    if (validated.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: validated.sku },
      });
      if (existingSku) {
        return { success: false, error: t("skuExists") };
      }
    }

    const product = await prisma.product.create({
      data: {
        type: validated.type,
        sku: validated.sku || null,
        name: validated.name,
        description: validated.description || null,
        price: new Decimal(validated.price),
        cost: validated.cost ? new Decimal(validated.cost) : null,
        active: validated.active,
      },
    });

    revalidatePath("/products");

    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: t("skuExists") };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : t("createFailed"),
    };
  }
};

export const updateProduct = async (
  input: UpdateProductInput
): Promise<ActionResponse<Product>> => {
  const t = await getTranslations("Products.errors");
  
  try {
    await requireAuth();

    const validated = updateProductSchema.parse(input);

    // Check if SKU already exists for a different product (if provided)
    if (validated.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: validated.sku },
      });
      if (existingSku && existingSku.id !== validated.id) {
        return { success: false, error: t("skuExists") };
      }
    }

    const product = await prisma.product.update({
      where: { id: validated.id },
      data: {
        type: validated.type,
        sku: validated.sku || null,
        name: validated.name,
        description: validated.description || null,
        price: new Decimal(validated.price),
        cost: validated.cost ? new Decimal(validated.cost) : null,
        active: validated.active,
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${product.id}`);

    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: t("skuExists") };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : t("updateFailed"),
    };
  }
};

export const deleteProduct = async (
  id: string
): Promise<ActionResponse<void>> => {
  const t = await getTranslations("Products.errors");
  
  try {
    await requireAuth();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            saleItems: true,
            stockMoves: true,
            purchaseItems: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: t("notFound") };
    }

    if (
      product._count.saleItems > 0 ||
      product._count.stockMoves > 0 ||
      product._count.purchaseItems > 0
    ) {
      return {
        success: false,
        error: t("cannotDelete"),
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/products");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("deleteFailed"),
    };
  }
};

