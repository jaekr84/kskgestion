"use client";

import Link from "next/link";
import { Store, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Store className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
              KsK Gestion
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Inicio
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-indigo-600 hover:bg-indigo-700 font-bold px-6"
              )}
            >
              Registrarse Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-in slide-in-from-top-2">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="block text-lg font-medium text-slate-600 px-4 py-2 hover:bg-slate-50 rounded-lg"
          >
            Inicio
          </Link>
          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)}
            className="block text-lg font-medium text-slate-600 px-4 py-2 hover:bg-slate-50 rounded-lg"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            onClick={() => setIsOpen(false)}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-center"
            )}
          >
            Registrarse Gratis
          </Link>
        </div>
      )}
    </nav>
  );
}
