"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Suspense } from "react";

import { loginAction } from "@/lib/actions/login";

function LoginContent() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  return (
    <Card className="w-full max-w-md border-none shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
            <Store className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Bienvenido de nuevo</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={loginAction} className="space-y-4">
          {isRegistered && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm font-medium">¡Registro exitoso! Ya puedes iniciar sesión.</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="email@ejemplo.com" className="h-11" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" className="h-11" required />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-semibold mt-2">
            Entrar
          </Button>
          
          <div className="text-center text-sm mt-4 text-slate-500">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
