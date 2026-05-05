"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, ChevronRight, Truck, MapPin, FileText, Trash2, PackagePlus, Search, SplitSquareVertical, ClipboardCheck } from "lucide-react";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { createPurchaseAction } from "@/lib/actions/purchases";
import { formatCurrency } from "@/lib/utils";
import { ProductForm } from "@/components/inventory/product-form";

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  distribution: Record<number, number>; // { branchId: qty }
}

export function PurchaseForm({ branches, products, suppliers, categories = [], onSuccess }: {
  branches: any[];
  products: any[];
  suppliers: any[];
  categories?: any[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id?.toString() || "");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isDistributed, setIsDistributed] = useState(false);
  const [requiresReception, setRequiresReception] = useState(false);

  // Items
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [searchProduct, setSearchProduct] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchProduct) return products.slice(0, 10);
    const q = searchProduct.toLowerCase();
    return products.filter((p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [products, searchProduct]);

  const addItem = (product: any) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      // Default distribution: all to first branch
      const defaultDist: Record<number, number> = {};
      branches.forEach(b => { defaultDist[b.id] = 0; });
      if (branches[0]) defaultDist[branches[0].id] = 1;

      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitCost: parseFloat(product.cost) || 0,
        distribution: defaultDist,
      }]);
    }
    setSearchProduct("");
  };

  const updateItemField = (productId: number, field: "quantity" | "unitCost", value: number) => {
    setItems(items.map(i => {
      if (i.productId !== productId) return i;
      if (field === "quantity" && !isDistributed) {
        // In single mode, update quantity directly
        return { ...i, quantity: value };
      }
      return { ...i, [field]: value };
    }));
  };

  const updateDistribution = (productId: number, branchId: number, qty: number) => {
    setItems(items.map(i => {
      if (i.productId !== productId) return i;
      const newDist = { ...i.distribution, [branchId]: qty };
      const totalQty = Object.values(newDist).reduce((a, b) => a + b, 0);
      return { ...i, distribution: newDist, quantity: totalQty };
    }));
  };

  const removeItem = (productId: number) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const subtotal = items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);
  const ivaAmount = subtotal * 0.21;
  const total = subtotal + ivaAmount;

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Agregá al menos un producto");
      return;
    }
    if (!isDistributed && !branchId) {
      alert("Seleccioná una sucursal destino");
      return;
    }

    setIsLoading(true);

    const result = await createPurchaseAction({
      supplierId: supplierId ? parseInt(supplierId) : undefined,
      branchId: isDistributed ? undefined : parseInt(branchId),
      invoiceNumber: invoiceNumber || undefined,
      purchaseDate,
      notes: notes || undefined,
      requiresReception,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        distribution: isDistributed ? i.distribution : undefined,
      })),
    });

    setIsLoading(false);

    if (result.success) {
      alert("Compra registrada correctamente");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } else {
      alert(result.error || "Error al registrar la compra");
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setNewSupplierName("");
    setBranchId(branches[0]?.id?.toString() || "");
    setInvoiceNumber("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setItems([]);
    setSearchProduct("");
    setIsDistributed(false);
    setRequiresReception(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
          <Plus className="w-4 h-4" /> Nueva Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl overflow-hidden p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-transparent">
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Gestión de Compras
                  </div>
                  <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight animate-in fade-in slide-in-from-left-4 duration-700">
                    Nueva <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Compra</span>
                  </DialogTitle>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-inner">
                  <ShoppingCart className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

              {/* 01. Datos generales */}
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-lg">01</div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Datos de la Compra</h4>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Proveedor</Label>
                    <CreatableCombobox
                      options={suppliers}
                      value={supplierId}
                      newName={newSupplierName}
                      onSelect={(id, name) => {
                        setSupplierId(id?.toString() || "");
                        setNewSupplierName(id ? "" : name);
                      }}
                      placeholder="Buscar o crear proveedor..."
                      icon={<Truck className="size-4 text-slate-400" />}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Nro. Factura</Label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="0001-00000123"
                        className="pl-11 h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Fecha de Compra</Label>
                    <Input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
                    />
                  </div>

                  {/* Destination mode toggle */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Destino</Label>
                    <div className="flex gap-2 h-14">
                      <Button
                        type="button"
                        variant={!isDistributed ? "default" : "outline"}
                        onClick={() => setIsDistributed(false)}
                        className={`flex-1 h-full rounded-2xl gap-2 text-xs font-bold uppercase tracking-wider transition-all ${!isDistributed ? "bg-slate-950 text-white" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <MapPin className="w-4 h-4" /> Sucursal Única
                      </Button>
                      <Button
                        type="button"
                        variant={isDistributed ? "default" : "outline"}
                        onClick={() => setIsDistributed(true)}
                        className={`flex-1 h-full rounded-2xl gap-2 text-xs font-bold uppercase tracking-wider transition-all ${isDistributed ? "bg-slate-950 text-white" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <SplitSquareVertical className="w-4 h-4" /> Distribuir
                      </Button>
                    </div>
                  </div>

                  {/* Reception mode toggle */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Impacto en Stock</Label>
                    <div className="flex gap-2 h-14">
                      <Button
                        type="button"
                        variant={!requiresReception ? "default" : "outline"}
                        onClick={() => setRequiresReception(false)}
                        className={`flex-1 h-full rounded-2xl gap-2 text-xs font-bold uppercase tracking-wider transition-all ${!requiresReception ? "bg-slate-950 text-white" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <ShoppingCart className="w-4 h-4" /> Impacto Directo
                      </Button>
                      <Button
                        type="button"
                        variant={requiresReception ? "default" : "outline"}
                        onClick={() => setRequiresReception(true)}
                        className={`flex-1 h-full rounded-2xl gap-2 text-xs font-bold uppercase tracking-wider transition-all ${requiresReception ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <ClipboardCheck className="w-4 h-4" /> Requiere Recepción
                      </Button>
                    </div>
                    {requiresReception && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        El stock no se actualizará hasta que cada sucursal confirme la recepción.
                      </p>
                    )}
                  </div>
                </div>

                {/* Single branch selector */}
                {!isDistributed && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Sucursal Destino</Label>
                    <Select value={branchId} onValueChange={setBranchId}>
                      <SelectTrigger className="h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <MapPin className="size-4 text-slate-400" />
                          <SelectValue placeholder="Seleccionar sucursal" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 02. Productos */}
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-lg">02</div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Productos</h4>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Product search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      placeholder="Buscar producto por nombre, SKU o código..."
                      className="pl-11 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
                    />
                  </div>
                  <ProductForm 
                    branches={branches} 
                    categories={categories} 
                    suppliers={suppliers}
                    onSuccess={() => {
                      router.refresh();
                    }}
                  />
                </div>

                {/* Search results */}
                {searchProduct && (
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-400">No se encontraron productos</div>
                    ) : (
                      filteredProducts.map((product: any) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addItem(product)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{product.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                              {product.sku && `SKU: ${product.sku}`}
                              {product.sku && product.barcode && " · "}
                              {product.barcode && `Cód: ${product.barcode}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {product.cost && <span className="text-xs text-slate-500">{formatCurrency(parseFloat(product.cost))}</span>}
                            <PackagePlus className="w-4 h-4 text-indigo-500" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Items table - Excel style */}
                {items.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Producto</th>
                          <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap w-24">$ Unit.</th>
                          {isDistributed ? (
                            branches.map((b) => (
                              <th key={b.id} className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap min-w-[60px]">
                                {b.name}
                              </th>
                            ))
                          ) : (
                            <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap w-20">Cant.</th>
                          )}
                          <th className="text-right px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap w-24">Subtotal</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={item.productId} className={`border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30 dark:bg-slate-900/30" : ""}`}>
                            <td className="px-3 py-2">
                              <span className="font-medium text-slate-900 dark:text-white truncate block max-w-[160px]">{item.productName}</span>
                            </td>
                            <td className="px-1 py-1.5">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) => updateItemField(item.productId, "unitCost", parseFloat(e.target.value) || 0)}
                                className="h-8 text-center text-xs font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg w-full"
                              />
                            </td>
                            {isDistributed ? (
                              branches.map((branch) => (
                                <td key={branch.id} className="px-1 py-1.5">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.distribution[branch.id] || 0}
                                    onChange={(e) => updateDistribution(item.productId, branch.id, parseInt(e.target.value) || 0)}
                                    className="h-8 text-center text-xs font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg w-full"
                                  />
                                </td>
                              ))
                            ) : (
                              <td className="px-1 py-1.5">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItemField(item.productId, "quantity", parseInt(e.target.value) || 1)}
                                  className="h-8 text-center text-xs font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg w-full"
                                />
                              </td>
                            )}
                            <td className="px-3 py-2 text-right">
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">{formatCurrency(item.quantity * item.unitCost)}</span>
                            </td>
                            <td className="px-1 py-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.productId)}
                                className="h-7 w-7 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {items.length === 0 && !searchProduct && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <PackagePlus className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Buscá productos para agregarlos</p>
                  </div>
                )}
              </div>

              {/* 03. Resumen Financiero */}
              {items.length > 0 && (
                <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Resumen</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{items.length} {items.length === 1 ? "ítem" : "ítems"}</span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">IVA (21%)</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(ivaAmount)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="space-y-2 pb-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Notas (opcional)</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones de la compra..."
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
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
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || items.length === 0}
                className="bg-slate-950 hover:bg-indigo-600 text-white px-12 h-14 rounded-2xl shadow-2xl shadow-indigo-200 dark:shadow-none transition-all duration-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"
              >
                {isLoading ? (
                  <span className="animate-pulse">Guardando...</span>
                ) : (
                  <>
                    Confirmar Compra
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
