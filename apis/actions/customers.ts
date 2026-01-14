"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { dateOnlyToUTC } from "@/lib/date-utils";
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/lib/validations/customer";
import type { Customer } from "@/prisma/prisma-client";

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

export const getCustomers = async (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{ customers: Customer[]; total: number }>> => {
  try {
    await requireAuth();

    const { search = "", limit = 50, offset = 0 } = params || {};

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { docId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return { success: true, data: { customers, total } };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch customers",
    };
  }
};

export const getCustomer = async (
  id: string
): Promise<ActionResponse<Customer>> => {
  try {
    await requireAuth();

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    return { success: true, data: customer };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch customer",
    };
  }
};

export const createCustomer = async (
  input: CreateCustomerInput
): Promise<ActionResponse<Customer>> => {
  try {
    await requireAuth();

    const validated = createCustomerSchema.parse(input);

    const customer = await prisma.customer.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        docId: validated.docId || null,
        birthdate: dateOnlyToUTC(validated.birthdate),
        note: validated.note || null,
      },
    });

    revalidatePath("/customers");

    return { success: true, data: customer };
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "A customer with this email already exists",
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create customer",
    };
  }
};

export const updateCustomer = async (
  input: UpdateCustomerInput
): Promise<ActionResponse<Customer>> => {
  try {
    await requireAuth();

    const validated = updateCustomerSchema.parse(input);

    const customer = await prisma.customer.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        docId: validated.docId || null,
        birthdate: dateOnlyToUTC(validated.birthdate),
        note: validated.note || null,
      },
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.id}`);

    return { success: true, data: customer };
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "A customer with this email already exists",
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update customer",
    };
  }
};

export const deleteCustomer = async (
  id: string
): Promise<ActionResponse<void>> => {
  try {
    await requireAuth();

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sales: true,
            receivables: true,
          },
        },
      },
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    if (customer._count.sales > 0 || customer._count.receivables > 0) {
      return {
        success: false,
        error: "Cannot delete customer with existing sales or receivables",
      };
    }

    await prisma.customer.delete({
      where: { id },
    });

    revalidatePath("/customers");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
};
