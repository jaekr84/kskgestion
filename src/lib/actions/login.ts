"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // 1. Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // For demo purposes, if user doesn't exist, we'll just redirect to register or show error
      // But let's assume they exist if they just registered
      return { error: "Usuario no encontrado" };
    }

    // 2. Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("tenant_id", user.tenantId.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

  } catch (error) {
    console.error("Login error:", error);
    return { error: "Error al iniciar sesión" };
  }
  
  redirect("/dashboard");
}
