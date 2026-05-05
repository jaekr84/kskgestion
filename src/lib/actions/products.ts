"use server";

import { db } from "@/db";
import { products, inventory, branches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "./tenants";

export async function getProductsAction() {
  const tenantId = await getTenantId();
  return await db.query.products.findMany({
    where: eq(products.tenantId, tenantId),
    with: {
      inventory: true,
    },
  });
}

export async function createProductAction(data: {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  markup?: number;
  iva?: number;
  priceIncludesIva?: boolean;
  minStock?: number;
  categoryId?: number;
  supplierId?: number;
  externalSku?: string;
  initialStock?: { branchId: number; stock: number }[];
}) {
  try {
    const tenantId = await getTenantId();

    const [newProduct] = await db.insert(products).values({
      tenantId: tenantId,
      name: data.name,
      description: data.description,
      sku: data.sku,
      barcode: data.barcode,
      price: data.price.toString(),
      cost: data.cost?.toString(),
      markup: data.markup?.toString(),
      iva: data.iva?.toString(),
      priceIncludesIva: data.priceIncludesIva,
      minStock: data.minStock,
      categoryId: data.categoryId,
      supplierId: data.supplierId,
      externalSku: data.externalSku,
    }).returning();

    if (data.initialStock && data.initialStock.length > 0) {
      const inventoryValues = data.initialStock.map(item => ({
        branchId: item.branchId,
        productId: newProduct.id,
        stock: item.stock,
      }));
      await db.insert(inventory).values(inventoryValues);
    }

    revalidatePath("/inventario");
    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Error al crear el producto" };
  }
}

export async function updateProductAction(id: number, data: {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  markup?: number;
  iva?: number;
  priceIncludesIva?: boolean;
  minStock?: number;
  categoryId?: number;
  supplierId?: number;
  externalSku?: string;
}) {
  try {
    const tenantId = await getTenantId();

    await db.update(products)
      .set({
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        price: data.price.toString(),
        cost: data.cost?.toString(),
        markup: data.markup?.toString(),
        iva: data.iva?.toString(),
        priceIncludesIva: data.priceIncludesIva,
        minStock: data.minStock,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        externalSku: data.externalSku,
      })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));

    revalidatePath("/inventario");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Error al actualizar el producto" };
  }
}

export async function deleteProductAction(id: number) {
  try {
    const tenantId = await getTenantId();

    // Delete inventory first
    await db.delete(inventory).where(eq(inventory.productId, id));
    
    // Delete product
    await db.delete(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));

    revalidatePath("/inventario");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Error al eliminar el producto" };
  }
}

export async function generateUniqueBarcodeAction() {
  try {
    const tenantId = await getTenantId();
    let isUnique = false;
    let barcode = "";
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      // Generate a 13-digit random number (EAN-13 style prefix 779 for Argentina)
      const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
      barcode = `779${randomPart}1`; // Fixed prefix and suffix for simplicity
      
      const existing = await db.query.products.findFirst({
        where: and(eq(products.tenantId, tenantId), eq(products.barcode, barcode))
      });

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    return { success: true, barcode };
  } catch (error) {
    console.error("Error generating barcode:", error);
    return { success: false, error: "Error al generar código" };
  }
}
