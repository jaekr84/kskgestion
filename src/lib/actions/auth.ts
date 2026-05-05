"use server";

import { db } from "@/db";
import { tenants, branches, users, roles, usersToBranches } from "@/db/schema";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const businessName = formData.get("businessName") as string;
  const province = formData.get("province") as string;
  const city = formData.get("city") as string;
  const address = formData.get("address") as string;
  const cuit = formData.get("cuit") as string;
  const taxCondition = formData.get("taxCondition") as string;

  try {
    // 1. Create Tenant
    const [newTenant] = await db.insert(tenants).values({
      name: businessName,
      slug: businessName.toLowerCase().replace(/\s+/g, "-"),
      cuit,
      taxCondition,
      email,
      address,
      province,
      city,
    }).returning();

    // 2. Create Default Branch
    const [mainBranch] = await db.insert(branches).values({
      tenantId: newTenant.id,
      name: "Casa Central",
      address,
      province,
      city,
    }).returning();

    // 3. Create Default Roles
    const [adminRole] = await db.insert(roles).values({
      tenantId: newTenant.id,
      name: "Administrador",
      description: "Acceso total al sistema",
      permissions: JSON.stringify(["dashboard", "pos", "compras", "recepciones", "inventario", "configuracion", "usuarios"]),
    }).returning();

    await db.insert(roles).values({
      tenantId: newTenant.id,
      name: "Vendedor",
      description: "Acceso limitado a ventas y caja",
      permissions: JSON.stringify(["pos", "recepciones", "inventario"]),
    });

    // 4. Create Admin User
    const [newUser] = await db.insert(users).values({
      tenantId: newTenant.id,
      roleId: adminRole.id,
      name,
      email,
    }).returning();

    // 5. Link User to Main Branch
    await db.insert(usersToBranches).values({
      userId: newUser.id,
      branchId: mainBranch.id,
    });

    // 6. Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("tenant_id", newTenant.id.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

  } catch (error) {
    console.error("Error during registration:", error);
    throw new Error("No se pudo completar el registro.");
  }

  redirect("/dashboard"); // Redirect directly to dashboard since they are now "logged in"
}
