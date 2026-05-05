"use server";

import { db } from "@/db";
import { branches } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "./tenants";

export async function createBranchAction(data: {
  name: string;
  address?: string;
  province?: string;
  city?: string;
}) {
  try {
    const tenantId = await getTenantId();

    // Limit check: max 5 branches
    const [branchCount] = await db
      .select({ val: count() })
      .from(branches)
      .where(eq(branches.tenantId, tenantId));

    if (branchCount.val >= 5) {
      return { success: false, error: "Has alcanzado el límite máximo de 5 sucursales." };
    }

    await db.insert(branches).values({
      tenantId: tenantId,
      name: data.name,
      address: data.address,
      province: data.province,
      city: data.city,
      isActive: true,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error creating branch:", error);
    return { success: false, error: "Error al crear la sucursal" };
  }
}

export async function updateBranchAction(id: number, data: {
  name: string;
  address?: string;
  province?: string;
  city?: string;
  isActive?: boolean;
}) {
  try {
    const tenantId = await getTenantId();

    await db
      .update(branches)
      .set({
        name: data.name,
        address: data.address,
        province: data.province,
        city: data.city,
        isActive: data.isActive,
      })
      .where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating branch:", error);
    return { success: false, error: "Error al actualizar la sucursal" };
  }
}

export async function deleteBranchAction(id: number) {
  try {
    const tenantId = await getTenantId();

    // Check if it's not the last branch? Maybe optional.
    // For now just delete.
    await db.delete(branches).where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return { success: false, error: "Error al eliminar la sucursal" };
  }
}
