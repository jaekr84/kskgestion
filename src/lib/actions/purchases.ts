"use server";

import { db } from "@/db";
import { purchases, purchaseItems, stockReceptions, stockReceptionItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "./tenants";
import { updateStock } from "./inventory";

export async function createPurchaseAction(data: {
  supplierId?: number;
  branchId?: number;
  invoiceNumber?: string;
  status?: string;
  notes?: string;
  purchaseDate?: string;
  requiresReception?: boolean;
  items: {
    productId: number;
    quantity: number;
    unitCost: number;
    distribution?: Record<number, number>;
  }[];
}) {
  try {
    const tenantId = await getTenantId();

    const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
    const ivaAmount = subtotal * 0.21;
    const total = subtotal + ivaAmount;

    // If requires reception, status is "en_transito"
    const purchaseStatus = data.requiresReception ? "en_transito" : (data.status || "recibida");

    const [newPurchase] = await db.insert(purchases).values({
      tenantId,
      supplierId: data.supplierId,
      branchId: data.branchId || null,
      invoiceNumber: data.invoiceNumber,
      status: purchaseStatus,
      subtotal: subtotal.toFixed(2),
      iva: ivaAmount.toFixed(2),
      total: total.toFixed(2),
      notes: data.notes,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
    }).returning();

    // Insert purchase items
    for (const item of data.items) {
      await db.insert(purchaseItems).values({
        purchaseId: newPurchase.id,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost.toFixed(2),
        subtotal: (item.quantity * item.unitCost).toFixed(2),
      });
    }

    if (data.requiresReception) {
      // Generate stock receptions per branch
      if (data.items[0]?.distribution) {
        // Distributed mode: one reception per branch that has items
        const branchMap = new Map<number, { productId: number; quantity: number }[]>();

        for (const item of data.items) {
          for (const [bId, qty] of Object.entries(item.distribution || {})) {
            const branchId = parseInt(bId);
            if (qty <= 0) continue;
            if (!branchMap.has(branchId)) branchMap.set(branchId, []);
            branchMap.get(branchId)!.push({ productId: item.productId, quantity: qty });
          }
        }

        for (const [branchId, branchItems] of branchMap) {
          const [reception] = await db.insert(stockReceptions).values({
            purchaseId: newPurchase.id,
            branchId,
            status: "pendiente",
          }).returning();

          for (const ri of branchItems) {
            await db.insert(stockReceptionItems).values({
              receptionId: reception.id,
              productId: ri.productId,
              expectedQuantity: ri.quantity,
            });
          }
        }
      } else if (data.branchId) {
        // Single branch mode: one reception
        const [reception] = await db.insert(stockReceptions).values({
          purchaseId: newPurchase.id,
          branchId: data.branchId,
          status: "pendiente",
        }).returning();

        for (const item of data.items) {
          await db.insert(stockReceptionItems).values({
            receptionId: reception.id,
            productId: item.productId,
            expectedQuantity: item.quantity,
          });
        }
      }
    } else {
      // Direct impact: update stock immediately
      for (const item of data.items) {
        if (item.distribution) {
          for (const [bId, qty] of Object.entries(item.distribution)) {
            if (qty <= 0) continue;
            await updateStock(parseInt(bId), item.productId, qty);
          }
        } else if (data.branchId) {
          await updateStock(data.branchId, item.productId, item.quantity);
        }
      }
    }

    revalidatePath("/compras");
    revalidatePath("/inventario");
    revalidatePath("/recepciones");
    return { success: true, purchase: newPurchase };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return { success: false, error: "No se pudo registrar la compra" };
  }
}


