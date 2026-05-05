"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, Store, Trash2, Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import { createBranchAction, updateBranchAction, deleteBranchAction } from "@/lib/actions/branches";
import { GeorefSelects } from "@/components/georef/georef-selects";

export function BranchesTab({ branches }: { branches: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    province: "",
    city: "",
  });

  const handleReset = () => {
    setFormData({ name: "", address: "", province: "", city: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (branch: any) => {
    setFormData({
      name: branch.name,
      address: branch.address || "",
      province: branch.province || "",
      city: branch.city || "",
    });
    setEditingId(branch.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let result;
    if (editingId) {
      result = await updateBranchAction(editingId, formData);
    } else {
      result = await createBranchAction(formData);
    }

    setIsLoading(false);
    if (result.success) {
      handleReset();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta sucursal?")) {
      const result = await deleteBranchAction(id);
      if (!result.success) alert(result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sucursales</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona los puntos de venta de tu negocio ({branches.length}/5)
          </p>
        </div>
        {!isAdding && branches.length < 5 && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Sucursal
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/10 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                {editingId ? "Editar Sucursal" : "Nueva Sucursal"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nombre de la Sucursal</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., Sucursal Centro"
                    required
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 z-10" />
                    <Input 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Calle 123"
                      className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                    />
                  </div>
                </div>
              </div>

              <GeorefSelects 
                initialProvinceName={formData.province}
                initialLocalityName={formData.city}
                onProvinceChange={(_, name) => setFormData({ ...formData, province: name })}
                onLocalityChange={(_, name) => setFormData({ ...formData, city: name })}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={handleReset} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 text-white min-w-[120px]">
                  {isLoading ? "Guardando..." : editingId ? "Actualizar" : "Crear Sucursal"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className="group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)} className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(branch.id)} className="h-8 w-8 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{branch.name}</h3>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{branch.address || "Sin dirección"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span>{branch.city}, {branch.province}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {branches.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No hay sucursales</h3>
            <p className="text-slate-500 mb-6">Comienza agregando tu primer punto de venta.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Agregar primera sucursal
            </Button>
          </div>
        )}
      </div>

      {branches.length >= 5 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">
            Has alcanzado el límite de 5 sucursales. Para añadir más, por favor contacta con soporte para ampliar tu plan.
          </p>
        </div>
      )}
    </div>
  );
}
