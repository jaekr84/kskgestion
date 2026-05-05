"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Barcode, DollarSign, Tag, Hash, Boxes, Plus, Percent, Truck, Layers, AlertCircle, ChevronRight, Sparkles } from "lucide-react";
import { createProductAction, updateProductAction, generateUniqueBarcodeAction } from "@/lib/actions/products";

export function ProductForm({ branches, categories = [], suppliers = [], product, onSuccess }: {
  branches: any[],
  categories?: any[],
  suppliers?: any[],
  product?: any,
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    externalSku: product?.externalSku || "",
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
      externalSku: formData.externalSku || undefined,
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
        name: "", description: "", sku: "", externalSku: "", barcode: "", price: "", cost: "",
        markup: "0", iva: "21", priceIncludesIva: true, minStock: "0",
        categoryId: "", supplierId: ""
      });
      onSuccess?.();
    }
  };

  const handleGenerateBarcode = async () => {
    setIsGeneratingBarcode(true);
    const result = await generateUniqueBarcodeAction();
    if (result.success && result.barcode) {
      setFormData(prev => ({ ...prev, barcode: result.barcode }));
    }
    setIsGeneratingBarcode(false);
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
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-transparent">
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col h-full max-h-[90vh]">
            {/* Header Section */}
            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Gestión de Inventario
                  </div>
                  <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight animate-in fade-in slide-in-from-left-4 duration-700">
                    {product ? "Editar" : "Nuevo"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Artículo</span>
                  </DialogTitle>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-inner">
                  <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-lg">01</div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Información General</h4>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">Nombre del Producto</Label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre descriptivo..."
                        required
                        className="pl-12 h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">Categoría</Label>
                      <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                        <SelectTrigger className="h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="Seleccionar..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl my-1">{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplierId" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">Proveedor</Label>
                      <Select value={formData.supplierId} onValueChange={(val) => setFormData({ ...formData, supplierId: val })}>
                        <SelectTrigger className="h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="Seleccionar..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                          {suppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id.toString()} className="rounded-xl my-1">{sup.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 02. Codes Section */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-lg">02</div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Codificación</h4>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">SKU Interno</Label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="INT-001"
                        className="pl-10 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="externalSku" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">SKU Externo</Label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="externalSku"
                        value={formData.externalSku}
                        onChange={(e) => setFormData({ ...formData, externalSku: e.target.value })}
                        placeholder="EXT-999"
                        className="pl-10 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">Código de Barras</Label>
                    <div className="relative group">
                      <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        placeholder="779..."
                        className="pl-10 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleGenerateBarcode}
                        disabled={isGeneratingBarcode}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Generar Código Aleatorio"
                      >
                        <Sparkles className={`w-4 h-4 ${isGeneratingBarcode ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 03. Financial Summary Card */}
              <div className="relative p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Estructura de Precios</h4>
                    <DollarSign className="w-5 h-5 text-indigo-600/30 dark:text-indigo-400/50" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Costo</Label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          value={formData.cost}
                          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                          className="pl-8 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="markup" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Markup (%)</Label>
                      <Input
                        id="markup"
                        type="number"
                        value={formData.markup}
                        onChange={(e) => setFormData({ ...formData, markup: e.target.value })}
                        className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iva" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">IVA (%)</Label>
                      <Input
                        id="iva"
                        type="number"
                        value={formData.iva}
                        onChange={(e) => setFormData({ ...formData, iva: e.target.value })}
                        className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1 px-1">
                    <Checkbox 
                      id="priceIncludesIva" 
                      checked={formData.priceIncludesIva}
                      onCheckedChange={(checked) => setFormData({ ...formData, priceIncludesIva: !!checked })}
                      className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <label htmlFor="priceIncludesIva" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      El precio de venta final ya incluye IVA
                    </label>
                  </div>

                  <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 ml-1">Precio de Venta Sugerido</Label>
                      <div className="relative group">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-light text-slate-300 tracking-tighter">$</span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="pl-8 h-20 text-6xl font-black text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none transition-all tracking-tighter"
                        />
                      </div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">Cálculo en Tiempo Real</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 04. Inventory Settings */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-lg">03</div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Stock y Alertas</h4>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label htmlFor="minStock" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 flex items-center gap-2 ml-1">
                      <AlertCircle className="w-3 h-3 text-amber-500" /> Nivel Crítico de Stock
                    </Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      className="h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
                      placeholder="0"
                    />
                  </div>

                  {!product && branches.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 flex items-center gap-2 ml-1">
                        <Boxes className="w-3 h-3 text-indigo-600" /> Existencias Iniciales
                      </Label>
                      <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="inline-flex gap-3 min-w-full">
                          {branches.map((branch) => (
                            <div key={branch.id} className="flex-1 min-w-[120px] p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                              <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 truncate block">
                                  {branch.name}
                                </span>
                              </div>
                              <Input
                                type="number"
                                value={initialStock[branch.id]}
                                onChange={(e) => setInitialStock({ ...initialStock, [branch.id]: parseInt(e.target.value) || 0 })}
                                className="h-10 text-center bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                                min="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <DialogFooter className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 gap-4 sm:justify-end mt-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="px-8 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-slate-950 hover:bg-indigo-600 text-white px-12 h-14 rounded-2xl shadow-2xl shadow-indigo-200 dark:shadow-none transition-all duration-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"
              >
                {isLoading ? (
                  <span className="animate-pulse">Guardando...</span>
                ) : (
                  <>
                    {product ? "Actualizar Artículo" : "Confirmar Alta"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
