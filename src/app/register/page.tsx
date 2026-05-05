import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Store className="w-10 h-10 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Crea tu cuenta</CardTitle>
          <CardDescription>
            Comienza a gestionar tus kioskos de forma profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
            Formulario de Registro (Próximamente)
          </div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
            Registrarse
          </Button>
          <div className="text-center text-sm mt-2 text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
