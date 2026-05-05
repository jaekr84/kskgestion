"use server";

import { db } from "@/db";
import { sales, saleItems, paymentMethods, paymentTerminals, branches, users } from "@/db/schema";
import { updateStock } from "./inventory";
import { getTenantId } from "./tenants";
import { getUserId } from "./auth";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

export async function getSalesAction() {
  try {
    const tenantId = await getTenantId();
    return await db.query.sales.findMany({
      where: eq(sales.tenantId, tenantId),
      with: {
        paymentMethod: true,
        terminal: true,
        branch: true,
        user: true,
        items: {
          with: {
            product: true,
          }
        }
      },
      orderBy: [desc(sales.createdAt)],
    });
  } catch (error) {
    console.error("Error getting sales:", error);
    return [];
  }
}

export async function createSaleAction(data: {
  branchId: number;
  shiftId: number;
  subtotal: number;
  discountAmount: number;
  surchargeAmount: number;
  total: number;
  paymentMethodId: number;
  terminalId?: number;
  paymentMethod: string; // Keep for legacy
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  try {
    const tenantId = await getTenantId();
    const userId = await getUserId();

    // 2. Create Sale Header
    const [newSale] = await db.insert(sales).values({
      tenantId,
      branchId: data.branchId,
      userId: userId,
      shiftId: data.shiftId,
      subtotal: data.subtotal.toFixed(2),
      discountAmount: data.discountAmount.toFixed(2),
      surchargeAmount: data.surchargeAmount.toFixed(2),
      total: data.total.toFixed(2),
      paymentMethodId: data.paymentMethodId,
      terminalId: data.terminalId,
      paymentMethod: data.paymentMethod,
      status: "completed",
    }).returning();

    // 3. Create Sale Items and Update Stock
    for (const item of data.items) {
      await db.insert(saleItems).values({
        saleId: newSale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: (item.quantity * item.unitPrice).toFixed(2),
      });

      // Discount stock (negative quantity)
      await updateStock(data.branchId, item.productId, -item.quantity);
    }

    revalidatePath("/pos");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    
    return { success: true, sale: newSale };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "No se pudo registrar la venta" };
  }
}
