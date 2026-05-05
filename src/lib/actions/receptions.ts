"use server";

import { db } from "@/db";
import { stockReceptions, stockReceptionItems, inventory, purchases } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "./tenants";

export async function getReceptionsAction() {
  const tenantId = await getTenantId();

  // Get all receptions for this tenant's purchases
  const allReceptions = await db.query.stockReceptions.findMany({
    with: {
      purchase: {
        with: {
          supplier: true,
          tenant: true,
        },
      },
      branch: true,
      receivedByUser: true,
      items: {
        with: {
          product: true,
        },
      },
    },
    orderBy: [desc(stockReceptions.createdAt)],
  });

  // Filter by tenant
  return allReceptions.filter(r => r.purchase.tenantId === tenantId);
}

export async function getPendingReceptionCountAction() {
  const tenantId = await getTenantId();

  const allReceptions = await db.query.stockReceptions.findMany({
    where: eq(stockReceptions.status, "pendiente"),
    with: {
      purchase: true,
      branch: true,
    },
  });

  // Filter by tenant and group by branch
  const tenantReceptions = allReceptions.filter(r => r.purchase.tenantId === tenantId);
  const byBranch: Record<number, number> = {};
  let total = 0;

  for (const r of tenantReceptions) {
    byBranch[r.branchId] = (byBranch[r.branchId] || 0) + 1;
    total++;
  }

  return { total, byBranch };
}

export async function confirmReceptionAction(data: {
  receptionId: number;
  items: {
    itemId: number;
    receivedQuantity: number;
    notes?: string;
  }[];
  notes?: string;
}) {
  try {
    // Get the reception with items
    const reception = await db.query.stockReceptions.findFirst({
      where: eq(stockReceptions.id, data.receptionId),
      with: {
        items: true,
        purchase: true,
      },
    });

    if (!reception) {
      return { success: false, error: "Recepción no encontrada" };
    }

    if (reception.status !== "pendiente") {
      return { success: false, error: "Esta recepción ya fue procesada" };
    }

    // Update each item's received quantity
    let hasDiscrepancy = false;
    let allZero = true;

    for (const item of data.items) {
      const expectedItem = reception.items.find(i => i.id === item.itemId);
      if (!expectedItem) continue;

      await db.update(stockReceptionItems)
        .set({
          receivedQuantity: item.receivedQuantity,
          notes: item.notes || null,
        })
        .where(eq(stockReceptionItems.id, item.itemId));

      if (item.receivedQuantity !== expectedItem.expectedQuantity) {
        hasDiscrepancy = true;
      }
      if (item.receivedQuantity > 0) {
        allZero = false;
      }

      // Update stock for received quantity
      if (item.receivedQuantity > 0) {
        await upsertStock(reception.branchId, expectedItem.productId, item.receivedQuantity);
      }
    }

    // Determine reception status
    let receptionStatus: string;
    if (allZero) {
      receptionStatus = "rechazada";
    } else if (hasDiscrepancy) {
      receptionStatus = "recibida_parcial";
    } else {
      receptionStatus = "recibida";
    }

    // Update reception
    await db.update(stockReceptions)
      .set({
        status: receptionStatus,
        receivedAt: new Date(),
        notes: data.notes || null,
      })
      .where(eq(stockReceptions.id, data.receptionId));

    // Check all receptions for the parent purchase
    const allReceptions = await db.query.stockReceptions.findMany({
      where: eq(stockReceptions.purchaseId, reception.purchaseId),
    });

    const allProcessed = allReceptions.every(r =>
      r.id === data.receptionId ? true : r.status !== "pendiente"
    );

    if (allProcessed) {
      const anyPartial = allReceptions.some(r => {
        const status = r.id === data.receptionId ? receptionStatus : r.status;
        return status === "recibida_parcial" || status === "rechazada";
      });

      await db.update(purchases)
        .set({ status: anyPartial ? "recibida_parcial" : "recibida" })
        .where(eq(purchases.id, reception.purchaseId));
    }

    revalidatePath("/recepciones");
    revalidatePath("/inventario");
    revalidatePath("/compras");
    return { success: true };
  } catch (error) {
    console.error("Error confirming reception:", error);
    return { success: false, error: "No se pudo confirmar la recepción" };
  }
}

async function upsertStock(branchId: number, productId: number, quantity: number) {
  const [existing] = await db.select().from(inventory).where(
    and(
      eq(inventory.branchId, branchId),
      eq(inventory.productId, productId)
    )
  );

  if (existing) {
    await db.update(inventory)
      .set({ stock: existing.stock + quantity, updatedAt: new Date() })
      .where(eq(inventory.id, existing.id));
  } else {
    await db.insert(inventory).values({ branchId, productId, stock: quantity });
  }
}
