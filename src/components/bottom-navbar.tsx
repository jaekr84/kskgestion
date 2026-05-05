"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  CreditCard,
  ClipboardCheck,
  LogOut,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/logout";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

import { hasPermission, ModuleKey } from "@/lib/permissions";

const navItems: { title: string; url: string; icon: any; module: ModuleKey }[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    title: "POS",
    url: "/pos",
    icon: ShoppingCart,
    module: "pos",
  },
  {
    title: "Ventas",
    url: "/ventas",
    icon: Receipt,
    module: "pos",
  },
  {
    title: "Compras",
    url: "/compras",
    icon: CreditCard,
    module: "compras",
  },
  {
    title: "Recepciones",
    url: "/recepciones",
    icon: ClipboardCheck,
    module: "recepciones",
  },
  {
    title: "Inventario",
    url: "/inventario",
    icon: Package,
    module: "inventario",
  },
  {
    title: "Ajustes",
    url: "/settings",
    icon: Settings,
    module: "configuracion",
  },
];

export function BottomNavbar({ permissionsJson, pendingReceptions = 0 }: { permissionsJson?: string; pendingReceptions?: number }) {
  const pathname = usePathname();

  // Recepciones is accessible to all roles, so we don't filter it out
  const filteredItems = permissionsJson 
    ? navItems.filter(item => item.module === "recepciones" || hasPermission(permissionsJson, item.module))
    : navItems;

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex items-center justify-around md:justify-center md:gap-8 px-4 h-20">
          {filteredItems.map((item) => {
            const isActive = pathname === item.url;
            const showBadge = item.url === "/recepciones" && pendingReceptions > 0;
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 group min-w-[70px]",
                  isActive 
                    ? "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30" 
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className={cn(
                  "relative transition-transform duration-300",
                  isActive && "scale-110 -translate-y-0.5"
                )}>
                  <item.icon size={isActive ? 26 : 24} strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] font-black shadow-lg shadow-amber-200 dark:shadow-none animate-in zoom-in-50 duration-300 ring-2 ring-white dark:ring-slate-900">
                      {pendingReceptions > 9 ? "9+" : pendingReceptions}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}>
                  {item.title}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-indigo-600 rounded-b-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                )}
              </Link>
            );
          })}
          
          <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-800 mx-4" />
          
          <button 
            onClick={() => logoutAction()}
            className="flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all group min-w-[70px]"
          >
            <LogOut size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100">
              Salir
            </span>
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
}
