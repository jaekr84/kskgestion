"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Intentando login para:", email);

  let success = false;
  try {
    // 1. Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      console.log("Usuario no encontrado:", email);
      return { error: "Usuario no encontrado" };
    }

    console.log("Usuario encontrado, seteando cookies...");

    // 2. Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("tenant_id", user.tenantId.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    cookieStore.set("user_id", user.id.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log("Cookies seteadas correctamente");
    success = true;
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Error al iniciar sesión" };
  }
  
  if (success) {
    console.log("Redirigiendo a /dashboard...");
    redirect("/dashboard");
  }
}
