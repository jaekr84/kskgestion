"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Barcode, DollarSign, Tag, Hash, Boxes, Plus, Percent, Truck, Layers, AlertCircle } from "lucide-react";
import { createProductAction, updateProductAction } from "@/lib/actions/products";

export function ProductForm({ branches, categories = [], suppliers = [], product, onSuccess }: {
  branches: any[],
  categories?: any[],
  suppliers?: any[],
  product?: any,
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    price: product?.price || "",
    cost: product?.cost || "",
    markup: product?.markup || "0",
    iva: product?.iva || "21",
    priceIncludesIva: product?.priceIncludesIva ?? true,
    minStock: product?.minStock || "0",
    categoryId: product?.categoryId?.toString() || "",
    supplierId: product?.supplierId?.toString() || "",
  });

  const [initialStock, setInitialStock] = useState<Record<number, number>>(
    product ? {} : branches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {})
  );

  // Auto-calculate price based on cost and markup
  useEffect(() => {
    if (formData.cost && formData.markup && formData.iva) {
      const cost = parseFloat(formData.cost);
      const markup = parseFloat(formData.markup);
      const iva = parseFloat(formData.iva);
      
      if (isNaN(cost) || isNaN(markup) || isNaN(iva)) return;

      // Net price (before markup)
      let basePrice = cost * (1 + markup / 100);
      
      // Final price including or excluding IVA
      let finalPrice;
      if (formData.priceIncludesIva) {
        finalPrice = basePrice * (1 + iva / 100);
      } else {
        finalPrice = basePrice;
      }
      
      setFormData(prev => ({ ...prev, price: finalPrice.toFixed(2) }));
    }
  }, [formData.cost, formData.markup, formData.iva, formData.priceIncludesIva]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      markup: parseFloat(formData.markup),
      iva: parseFloat(formData.iva),
      minStock: parseInt(formData.minStock),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
      initialStock: product ? undefined : Object.entries(initialStock).map(([branchId, stock]) => ({
        branchId: parseInt(branchId),
        stock,
      })),
    };

    let result;
    if (product) {
      result = await updateProductAction(product.id, data);
    } else {
      result = await createProductAction(data);
    }

    setIsLoading(false);
    if (result.success) {
      setOpen(false);
      if (!product) setFormData({ 
        name: "", description: "", sku: "", barcode: "", price: "", cost: "", 
        markup: "0", iva: "21", priceIncludesIva: true, minStock: "0", 
        categoryId: "", supplierId: "" 
      });
      onSuccess?.();
    } else {
      alert(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          product ? (
            <Button variant="ghost" size="sm">Editar</Button>
          ) : (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
              <Plus className="w-4 h-4" /> Nuevo Artículo
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-4xl overflow-y-auto max-h-[95vh] p-0 border-none shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white dark:bg-slate-900">
          <div className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-3xl font-black uppercase tracking-tight">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                {product ? "Editar Artículo" : "Nuevo Artículo"}
              </DialogTitle>
              <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
                Gestión centralizada de stock y precios. Los cambios impactarán en todas las sucursales.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4" /> Información General
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-slate-500">Nombre del Producto</Label>
                    <div className="relative group">
                      <Tag className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="E.g., Alfajor Jorgito Chocolate"
                        required
                        className="pl-10 h-12 bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId" className="text-sm font-bold uppercase tracking-wider text-slate-500">Categoría</Label>
                      <Select 
                        value={formData.categoryId} 
                        onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                      >
                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="Seleccionar..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplierId" className="text-sm font-bold uppercase tracking-wider text-slate-500">Proveedor</Label>
                      <Select 
                        value={formData.supplierId} 
                        onValueChange={(val) => setFormData({ ...formData, supplierId: val })}
                      >
                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="Seleccionar..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id.toString()}>{sup.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku" className="text-sm font-bold uppercase tracking-wider text-slate-500">SKU / Código</Label>
                      <div className="relative group">
                        <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500" />
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="ART-001"
                          className="pl-10 h-12 bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="text-sm font-bold uppercase tracking-wider text-slate-500">Código Barras</Label>
                      <div className="relative group">
                        <Barcode className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500" />
                        <Input
                          id="barcode"
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          placeholder="779..."
                          className="pl-10 h-12 bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Stock */}
              <div className="space-y-8">
                {/* Pricing Section */}
                <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Precios y Tax
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="text-xs font-bold text-slate-500">Costo Base</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        className="h-11 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="markup" className="text-xs font-bold text-slate-500">Markup (%)</Label>
                        <div className="relative">
                          <Percent className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="markup"
                            type="number"
                            value={formData.markup}
                            onChange={(e) => setFormData({ ...formData, markup: e.target.value })}
                            className="h-11 pr-8 bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iva" className="text-xs font-bold text-slate-500">IVA (%)</Label>
                        <Input
                          id="iva"
                          type="number"
                          value={formData.iva}
                          onChange={(e) => setFormData({ ...formData, iva: e.target.value })}
                          className="h-11 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="priceIncludesIva" 
                        checked={formData.priceIncludesIva}
                        onCheckedChange={(checked) => setFormData({ ...formData, priceIncludesIva: !!checked })}
                      />
                      <label htmlFor="priceIncludesIva" className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-none cursor-pointer">
                        Precio final incluye IVA
                      </label>
                    </div>

                    <div className="pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                      <Label htmlFor="price" className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Precio de Venta Sugerido</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-3.5 w-6 h-6 text-indigo-600" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="pl-10 h-14 text-2xl font-black text-indigo-600 bg-white border-indigo-200 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Management */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="minStock" className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> Stock Mínimo (Alerta)
                    </Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      placeholder="Ej: 5"
                      className="h-12 bg-slate-50/50"
                    />
                  </div>

                  {!product && branches.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-indigo-600" /> Stock Inicial por Sucursal
                      </Label>
                      <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {branches.map((branch) => (
                          <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-medium">{branch.name}</span>
                            <Input
                              type="number"
                              value={initialStock[branch.id]}
                              onChange={(e) => setInitialStock({ ...initialStock, [branch.id]: parseInt(e.target.value) || 0 })}
                              className="w-20 h-8 text-center bg-white dark:bg-slate-900"
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="px-8">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-12 rounded-xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all">
              {isLoading ? "Guardando..." : product ? "Actualizar Artículo" : "Crear Artículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
