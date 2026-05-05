"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin, Save, CheckCircle2, Globe, FileText, Landmark } from "lucide-react";
import { updateTenantAction } from "@/lib/actions/tenants";
import { GeorefSelects } from "@/components/georef/georef-selects";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function GeneralTab({ tenant }: { tenant: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name || "",
    email: tenant.email || "",
    phone: tenant.phone || "",
    address: tenant.address || "",
    province: tenant.province || "",
    city: tenant.city || "",
    cuit: tenant.cuit || "",
    taxCondition: tenant.taxCondition || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    const result = await updateTenantAction(formData);

    setIsLoading(false);
    if (result.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Información General</CardTitle>
                <CardDescription>Datos principales de tu empresa para facturación y reportes.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-600 dark:text-slate-300">Nombre de la Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11"
                    placeholder="Mi Negocio S.A."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuit" className="text-slate-600 dark:text-slate-300">CUIT</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="cuit"
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11"
                    placeholder="30-12345678-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxCondition" className="text-slate-600 dark:text-slate-300">Condición Fiscal</Label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                  <Select 
                    value={formData.taxCondition} 
                    onValueChange={(val: string | null) => setFormData({ ...formData, taxCondition: val ?? "" })}
                  >
                    <SelectTrigger className="w-full h-11 pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Selecciona condición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monotributo">Monotributo</SelectItem>
                      <SelectItem value="responsable_inscripto">Responsable Inscripto</SelectItem>
                      <SelectItem value="exento">Exento</SelectItem>
                      <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 dark:text-slate-300">Email Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11"
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-600 dark:text-slate-300">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-600 dark:text-slate-300">Dirección Fiscal</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11"
                    placeholder="Av. Principal 123, CABA"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                <Globe className="w-4 h-4" />
                Ubicación
              </div>
              <GeorefSelects 
                initialProvinceName={formData.province}
                initialLocalityName={formData.city}
                onProvinceChange={(_, name) => setFormData({ ...formData, province: name })}
                onLocalityChange={(_, name) => setFormData({ ...formData, city: name })}
              />
              <div className="text-xs text-slate-400 italic">
                Actual: {formData.province || "No definida"}, {formData.city || "No definida"}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              {isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Cambios guardados</span>
                </div>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none min-w-[160px] gap-2 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
