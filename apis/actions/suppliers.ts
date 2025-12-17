"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import type { Supplier } from "@/prisma/prisma-client";

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to check authentication
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

/**
 * Get all suppliers
 */
export async function getSuppliers(params?: {
  search?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ suppliers: Supplier[]; total: number }>> {
  try {
    await requireAuth();

    const { search = "", active, limit = 50, offset = 0 } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { taxId: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: "asc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { success: true, data: { suppliers, total } };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch suppliers",
    };
  }
}

/**
 * Get supplier by ID
 */
export async function getSupplier(
  id: string,
): Promise<ActionResponse<Supplier>> {
  try {
    await requireAuth();

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return {
        success: false,
        error: "Supplier not found",
      };
    }

    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch supplier",
    };
  }
}

/**
 * Create supplier
 */
export async function createSupplier(input: {
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
}): Promise<ActionResponse<Supplier>> {
  try {
    await requireAuth();

    const supplier = await prisma.supplier.create({
      data: {
        name: input.name,
        taxId: input.taxId || null,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
      },
    });

    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create supplier",
    };
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(input: {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
}): Promise<ActionResponse<Supplier>> {
  try {
    await requireAuth();

    const supplier = await prisma.supplier.update({
      where: { id: input.id },
      data: {
        name: input.name,
        taxId: input.taxId || null,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
      },
    });

    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update supplier",
    };
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplier(
  id: string,
): Promise<ActionResponse<void>> {
  try {
    await requireAuth();

    await prisma.supplier.delete({
      where: { id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete supplier",
    };
  }
}
