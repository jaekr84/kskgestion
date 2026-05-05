"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, User, Mail, Building, Landmark } from "lucide-react";
import Link from "next/link";
import { GeorefSelects } from "@/components/georef/georef-selects";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [taxCondition, setTaxCondition] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
              <Store className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight uppercase">KsK Gestion</CardTitle>
          <CardDescription className="text-lg">
            Registra tu negocio y comienza a vender hoy mismo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4" /> Datos Personales
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                    <Input id="name" name="name" placeholder="Juan Pérez" required className="h-11 pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                    <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" required className="h-11 pl-10" />
                  </div>
                </div>
              </div>

              {/* Información del Negocio */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4" /> Mi Kiosko
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                    <Input id="businessName" name="businessName" placeholder="El Kiosko de Juan" required className="h-11 pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                    <Input id="cuit" name="cuit" placeholder="30-12345678-9" required className="h-11 pl-10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="taxCondition">Condición Fiscal</Label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 z-10" />
                  <Select name="taxCondition" onValueChange={(val: string | null) => setTaxCondition(val ?? "")} required>
                    <SelectTrigger className="h-11 pl-10">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monotributo">Monotributo</SelectItem>
                      <SelectItem value="responsable_inscripto">Responsable Inscripto</SelectItem>
                      <SelectItem value="exento">Exento</SelectItem>
                      <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <input type="hidden" name="taxCondition" value={taxCondition} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                  <Input id="address" name="address" placeholder="Av. Siempre Viva 123" required className="h-11 pl-10" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-bold text-slate-900 dark:text-white">Ubicación (Georef Argentina)</h3>
              <GeorefSelects 
                onProvinceChange={(_, name) => setProvince(name)}
                onLocalityChange={(_, name) => setCity(name)}
              />
              {/* Hidden inputs to pass Georef names to the Server Action */}
              <input type="hidden" name="province" value={province} />
              <input type="hidden" name="city" value={city} />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
              disabled={!province || !city}
            >
              Crear mi Cuenta
            </Button>

            <div className="text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
