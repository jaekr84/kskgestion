"use server";

import { db } from "@/db";
import { shifts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserId } from "./auth";

export async function getCurrentShiftAction(branchId: number) {
  try {
    const userId = await getUserId();
    const activeShift = await db.query.shifts.findFirst({
      where: and(
        eq(shifts.userId, userId),
        eq(shifts.branchId, branchId),
        eq(shifts.status, "open")
      ),
      orderBy: [desc(shifts.startTime)],
    });

    return { success: true, shift: activeShift || null };
  } catch (error) {
    console.error("Error getting current shift:", error);
    return { success: false, error: "Error al obtener el turno actual" };
  }
}

export async function openShiftAction(data: {
  tenantId: number;
  branchId: number;
  startCash: number;
  notes?: string;
}) {
  try {
    const userId = await getUserId();
    // Check if there's already an open shift
    const activeShift = await db.query.shifts.findFirst({
      where: and(
        eq(shifts.userId, userId),
        eq(shifts.branchId, data.branchId),
        eq(shifts.status, "open")
      ),
    });

    if (activeShift) {
      return { success: false, error: "Ya tienes un turno abierto en esta sucursal" };
    }

    const [newShift] = await db.insert(shifts).values({
      tenantId: data.tenantId,
      branchId: data.branchId,
      userId: userId,
      startCash: data.startCash.toString(),
      status: "open",
      notes: data.notes,
    }).returning();

    revalidatePath("/pos");
    return { success: true, shift: newShift };
  } catch (error) {
    console.error("Error opening shift:", error);
    return { success: false, error: "Error al abrir el turno" };
  }
}

export async function closeShiftAction(data: {
  shiftId: number;
  endCash: number;
  notes?: string;
}) {
  try {
    const [updatedShift] = await db.update(shifts)
      .set({
        endCash: data.endCash.toString(),
        endTime: new Date(),
        status: "closed",
        notes: data.notes,
      })
      .where(eq(shifts.id, data.shiftId))
      .returning();

    revalidatePath("/pos");
    return { success: true, shift: updatedShift };
  } catch (error) {
    console.error("Error closing shift:", error);
    return { success: false, error: "Error al cerrar el turno" };
  }
}
