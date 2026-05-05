"use server";

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getTenantId() {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("tenant_id")?.value;
  return tenantId ? parseInt(tenantId) : 1;
}

export async function getTenant() {
  const tenantId = await getTenantId();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  return tenant;
}

export async function updateTenantAction(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  city?: string;
  cuit?: string;
  taxCondition?: string;
}) {
  try {
    const tenantId = await getTenantId();
    await db.update(tenants)
      .set({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        province: data.province,
        city: data.city,
        cuit: data.cuit,
        taxCondition: data.taxCondition,
      })
      .where(eq(tenants.id, tenantId));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating tenant:", error);
    return { success: false, error: "No se pudieron actualizar los datos de la empresa" };
  }
}
