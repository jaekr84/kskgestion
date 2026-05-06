"use server";

import { db } from "@/db";
import { roles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantId } from "./tenants";
import { revalidatePath } from "next/cache";

export async function getRolesAction() {
  try {
    const tenantId = await getTenantId();
    return await db.query.roles.findMany({
      where: eq(roles.tenantId, tenantId),
      orderBy: [roles.name],
    });
  } catch (error) {
    console.error("Error getting roles:", error);
    return [];
  }
}

export async function createRoleAction(data: { name: string; description?: string; permissions: string[] }) {
  try {
    const tenantId = await getTenantId();
    await db.insert(roles).values({
      tenantId,
      name: data.name,
      description: data.description,
      permissions: JSON.stringify(data.permissions),
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Error al crear el rol" };
  }
}

export async function updateRoleAction(id: number, data: { name: string; description?: string; permissions: string[] }) {
  try {
    await db.update(roles)
      .set({
        name: data.name,
        description: data.description,
        permissions: JSON.stringify(data.permissions),
      })
      .where(eq(roles.id, id));
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Error al actualizar el rol" };
  }
}

export async function getUsersAction() {
  try {
    const tenantId = await getTenantId();
    return await db.query.users.findMany({
      where: eq(users.tenantId, tenantId),
      with: {
        role: true,
      },
      orderBy: [users.name],
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

export async function assignUserRoleAction(userId: number, roleId: number | null) {
  try {
    await db.update(users)
      .set({ roleId })
      .where(eq(users.id, userId));
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error assigning role:", error);
    return { success: false, error: "Error al asignar el rol" };
  }
}
