import { buttonVariants } from "@/components/ui/button";
import { Store } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 px-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl">
            <Store className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            KsK Gestion
          </h1>
          <p className="text-slate-500 text-lg">
            La plataforma integral para la gestión de tu kiosko.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
          <Link 
            href="/login" 
            className={cn(
              buttonVariants({ size: "lg" }),
              "flex-1 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold h-14 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
            )}
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "flex-1 text-lg font-semibold h-14 rounded-xl border-2 hover:bg-slate-50 transition-colors"
            )}
          >
            Registrarse
          </Link>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-slate-400 text-sm">
          Multi-tenant • Multi-sucursal • POS • Inventario
        </p>
      </div>
    </div>
  );
}
