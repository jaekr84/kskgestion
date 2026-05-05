"use server";

import { db } from "@/db";
import { inventory } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Actualiza el stock de un producto en una sucursal específica.
 * @param branchId ID de la sucursal
 * @param productId ID del producto
 * @param quantity Cantidad a sumar (positivo) o restar (negativo)
 */
export async function updateStock(branchId: number, productId: number, quantity: number) {
  try {
    const [existing] = await db.select().from(inventory).where(
      and(
        eq(inventory.branchId, branchId),
        eq(inventory.productId, productId)
      )
    );

    if (existing) {
      await db.update(inventory)
        .set({ 
          stock: existing.stock + quantity, 
          updatedAt: new Date() 
        })
        .where(eq(inventory.id, existing.id));
    } else {
      // Si no existe y estamos restando, igual lo creamos en negativo (o 0 si prefieres)
      // Pero para compras siempre lo creará en positivo.
      await db.insert(inventory).values({
        branchId,
        productId,
        stock: quantity,
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating stock:", error);
    throw new Error("No se pudo actualizar el inventario");
  }
}
