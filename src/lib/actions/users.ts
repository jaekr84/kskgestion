"use server";

import { db } from "@/db";
import { users, roles, branches, usersToBranches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getTenantId() {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("tenant_id")?.value;
  return tenantId ? parseInt(tenantId) : 1;
}

export async function getTenantData() {
  const tenantId = await getTenantId();
  const [allUsers, allRoles, allBranches] = await Promise.all([
    db.query.users.findMany({
      where: eq(users.tenantId, tenantId),
      with: {
        role: true,
      }
    }),
    db.query.roles.findMany({
      where: eq(roles.tenantId, tenantId),
    }),
    db.query.branches.findMany({
      where: eq(branches.tenantId, tenantId),
    }),
  ]);

  // Fetch branch assignments for each user
  const usersWithBranches = await Promise.all(allUsers.map(async (user) => {
    const assignments = await db.query.usersToBranches.findMany({
      where: eq(usersToBranches.userId, user.id),
    });
    return {
      ...user,
      branchIds: assignments.map(a => a.branchId),
    };
  }));

  return {
    users: usersWithBranches,
    roles: allRoles,
    branches: allBranches,
  };
}

export async function createUserAction(data: {
  name: string;
  email: string;
  roleId: number;
  branchIds: number[];
}) {
  try {
    const tenantId = await getTenantId();
    const [newUser] = await db.insert(users).values({
      tenantId: tenantId,
      name: data.name,
      email: data.email,
      roleId: data.roleId,
    }).returning();

    if (data.branchIds.length > 0) {
      await db.insert(usersToBranches).values(
        data.branchIds.map(branchId => ({
          userId: newUser.id,
          branchId,
        }))
      );
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "No se pudo crear el usuario" };
  }
}

export async function updateUserAction(id: number, data: {
  name: string;
  email: string;
  roleId: number;
  branchIds: number[];
}) {
  try {
    const tenantId = await getTenantId();
    await db.update(users)
      .set({
        name: data.name,
        email: data.email,
        roleId: data.roleId,
      })
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));

    // Sync branches: delete old, insert new
    await db.delete(usersToBranches).where(eq(usersToBranches.userId, id));
    
    if (data.branchIds.length > 0) {
      await db.insert(usersToBranches).values(
        data.branchIds.map(branchId => ({
          userId: id,
          branchId,
        }))
      );
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "No se pudo actualizar el usuario" };
  }
}

export async function deleteUserAction(id: number) {
  try {
    const tenantId = await getTenantId();
    // Delete branch associations first
    await db.delete(usersToBranches).where(eq(usersToBranches.userId, id));
    await db.delete(users).where(and(eq(users.id, id), eq(users.tenantId, tenantId)));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "No se pudo eliminar el usuario" };
  }
}
