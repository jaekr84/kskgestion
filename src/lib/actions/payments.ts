"use server";

import { db } from "@/db";
import { paymentMethods, paymentTerminals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "./tenants";

// Getters
export async function getPaymentMethodsAction(branchId?: number) {
  try {
    const tenantId = await getTenantId();
    return await db.query.paymentMethods.findMany({
      where: and(
        eq(paymentMethods.tenantId, tenantId),
        branchId ? eq(paymentMethods.branchId, branchId) : undefined
      ),
      orderBy: [paymentMethods.name],
    });
  } catch (error) {
    console.error("Error getting payment methods:", error);
    return [];
  }
}

export async function getTerminalsAction() {
  try {
    const tenantId = await getTenantId();
    return await db.query.paymentTerminals.findMany({
      where: eq(paymentTerminals.tenantId, tenantId),
      with: {
        branch: true,
      },
      orderBy: [paymentTerminals.name],
    });
  } catch (error) {
    console.error("Error getting terminals:", error);
    return [];
  }
}

// Payment Methods
export async function createPaymentMethodAction(data: {
  name: string;
  type: string;
  branchId: number;
}) {
  try {
    const tenantId = await getTenantId();
    await db.insert(paymentMethods).values({
      tenantId,
      branchId: data.branchId,
      name: data.name,
      type: data.type,
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error creating payment method:", error);
    return { success: false, error: "No se pudo crear el medio de pago" };
  }
}

export async function updatePaymentMethodAction(id: number, data: {
  name: string;
  type: string;
  isActive: boolean;
}) {
  try {
    const tenantId = await getTenantId();
    await db.update(paymentMethods)
      .set({
        name: data.name,
        type: data.type,
        isActive: data.isActive,
      })
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.tenantId, tenantId)));
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating payment method:", error);
    return { success: false, error: "No se pudo actualizar el medio de pago" };
  }
}

// Payment Terminals
export async function createTerminalAction(data: {
  name: string;
  branchId: number;
}) {
  try {
    const tenantId = await getTenantId();
    await db.insert(paymentTerminals).values({
      tenantId,
      branchId: data.branchId,
      name: data.name,
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error creating terminal:", error);
    return { success: false, error: "No se pudo crear la terminal" };
  }
}

export async function updateTerminalAction(id: number, data: {
  name: string;
  isActive: boolean;
}) {
  try {
    const tenantId = await getTenantId();
    await db.update(paymentTerminals)
      .set({
        name: data.name,
        isActive: data.isActive,
      })
      .where(and(eq(paymentTerminals.id, id), eq(paymentTerminals.tenantId, tenantId)));
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating terminal:", error);
    return { success: false, error: "No se pudo actualizar la terminal" };
  }
}
