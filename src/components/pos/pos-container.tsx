"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  User, 
  Store,
  Clock,
  ScanBarcode,
  ArrowRight,
  Calculator,
  History,
  Monitor
} from "lucide-react";
import { openShiftAction, getCurrentShiftAction, closeShiftAction } from "@/lib/actions/shifts";
import { createSaleAction } from "@/lib/actions/sales";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Product {
  id: number;
  name: string;
  price: string;
  barcode: string | null;
  sku: string | null;
  categoryId: number | null;
  inventory: { branchId: number; stock: number }[];
}

interface CartItem extends Product {
  cartQuantity: number;
}

export function POSContainer({ 
  initialProducts, 
  branches,
  paymentMethods,
  terminals,
  tenantId
}: { 
  initialProducts: any[], 
  branches: any[],
  paymentMethods: any[],
  terminals: any[],
  tenantId: number
}) {
  // State
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(
    branches.length === 1 ? branches[0].id : null
  );
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [isLoadingShift, setIsLoadingShift] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [selectedTerminalId, setSelectedTerminalId] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [surchargeAmount, setSurchargeAmount] = useState(0);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  
  // Modal states for shift
  const [isOpeningShift, setIsOpeningShift] = useState(false);
  const [startCash, setStartCash] = useState("");

  const formatInputValue = (val: string) => {
    // Remove non-numeric characters
    const numericValue = val.replace(/\D/g, "");
    if (!numericValue) return "";
    // Format with dots for thousands
    return new Intl.NumberFormat("es-AR").format(parseInt(numericValue));
  };

  const handleStartCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value);
    setStartCash(formatted);
  };

  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedBranchId) {
      checkShift(selectedBranchId);
    }
  }, [selectedBranchId]);

  async function checkShift(branchId: number) {
    setIsLoadingShift(true);
    const result = await getCurrentShiftAction(branchId);
    if (result.success) {
      setCurrentShift(result.shift);
    }
    setIsLoadingShift(false);
  }

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    toast.success(`Agregado: ${product.name}`);
    setSearch("");
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.cartQuantity), 0);
    return Math.max(0, subtotal - discountAmount + surchargeAmount);
  }, [cart, discountAmount, surchargeAmount]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.cartQuantity), 0);
  }, [cart]);

  // Filtering products for manual search
  const filteredProducts = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return initialProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.barcode?.includes(q) || 
      p.sku?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search, initialProducts]);

  // Handle Scan
  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = initialProducts.find(p => p.barcode === search || p.sku === search);
    if (product) {
      addToCart(product);
      setSearch("");
    } else {
      toast.error("Producto no encontrado");
    }
  };

  const handleOpenShift = async () => {
    if (!selectedBranchId) return;
    
    // Convert formatted string "34.000" back to number 34000
    const rawValue = startCash.replace(/\./g, "");
    
    const result = await openShiftAction({
      tenantId,
      branchId: selectedBranchId,
      startCash: parseFloat(rawValue) || 0,
    });

    if (result.success) {
      setCurrentShift(result.shift);
      setIsOpeningShift(false);
      toast.success("Turno abierto correctamente");
    } else {
      toast.error(result.error || "Error al abrir turno");
    }
  };

  // Handle Checkout
  const handleCheckout = async () => {
    if (!selectedBranchId || !currentShift) return;
    if (cart.length === 0) return;
    
    if (!selectedPaymentMethodId) {
      toast.error("Selecciona un medio de pago");
      return;
    }

    const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);
    if (paymentMethod?.type !== 'cash' && !selectedTerminalId && terminals.length > 0) {
      // If there are terminals and one is not selected for non-cash, we could alert, 
      // but some might not use terminals for all cards. Let's make it optional but recommended.
    }

    setIsProcessingSale(true);
    const result = await createSaleAction({
      branchId: selectedBranchId,
      shiftId: currentShift.id,
      subtotal: cartSubtotal,
      discountAmount,
      surchargeAmount,
      total: cartTotal,
      paymentMethodId: selectedPaymentMethodId,
      terminalId: selectedTerminalId || undefined,
      paymentMethod: paymentMethod?.name || "cash",
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.cartQuantity,
        unitPrice: parseFloat(item.price),
      })),
    });

    if (result.success) {
      toast.success("Venta realizada con éxito");
      setCart([]);
      setSearch("");
      setDiscountAmount(0);
      setSurchargeAmount(0);
      setSelectedPaymentMethodId(null);
      setSelectedTerminalId(null);
      scanInputRef.current?.focus();
    } else {
      toast.error(result.error);
    }
    setIsProcessingSale(false);
  };

  // 0. State: No Payment Methods Configured (Blocking)
  if (paymentMethods.length === 0) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden" hideCloseButton>
          <div className="bg-indigo-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Configuración Requerida</DialogTitle>
            <DialogDescription className="text-indigo-100 font-medium">
              Antes de empezar a vender, necesitas configurar al menos un medio de pago (Efectivo, Tarjeta, etc.).
            </DialogDescription>
          </div>
          <div className="p-8 space-y-4">
            <p className="text-sm text-slate-500 text-center">
              Esto solo toma un minuto y es necesario para que el sistema pueda registrar tus ventas y realizar el arqueo de caja correctamente.
            </p>
            <Button asChild className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-xl shadow-indigo-100">
              <Link href="/settings?tab=payments">
                Ir a Configuración de Pagos
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 1. Initial State: Select Branch
  if (!selectedBranchId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center">
            <Store className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-black">Seleccionar Sucursal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {branches.map(b => (
                <Button 
                  key={b.id} 
                  variant="outline" 
                  className="h-16 text-lg font-bold justify-between group hover:border-indigo-500 hover:bg-indigo-50/50"
                  onClick={() => setSelectedBranchId(b.id)}
                >
                  <span className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                    {b.name}
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. State: No Open Shift
  if (!currentShift && !isLoadingShift) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-black">Turno Cerrado</CardTitle>
            <p className="text-slate-500 text-sm">Debes abrir un turno para empezar a vender en {branches.find(b => b.id === selectedBranchId)?.name}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Monto Inicial en Caja</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  type="text" 
                  inputMode="numeric"
                  value={startCash}
                  onChange={handleStartCashChange}
                  onFocus={(e) => e.target.select()}
                  className="pl-12 h-14 text-xl font-bold rounded-2xl"
                  placeholder="0"
                />
              </div>
            </div>
            <Button 
              className="w-full h-16 text-lg font-black bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none"
              onClick={handleOpenShift}
            >
              Abrir Turno
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-slate-400 text-xs uppercase font-bold"
              onClick={() => setSelectedBranchId(null)}
            >
              Cambiar de Sucursal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Main POS UI
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Left Column: Products & Search */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        
        {/* Header / Search */}
        <div className="p-4 md:p-6 space-y-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">{branches.find(b => b.id === selectedBranchId)?.name}</h1>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">POS Activo • Turno #{currentShift?.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs font-bold gap-2">
                <History className="w-4 h-4" /> Ventas Hoy
              </Button>
            </div>
          </div>

          <form onSubmit={handleScan} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-indigo-500" />
            </div>
            <Input 
              ref={scanInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escanea o busca producto..."
              className="h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl text-lg font-bold shadow-inner focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              autoFocus
            />
            {search && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{p.barcode || p.sku || 'Sin código'}</p>
                    </div>
                    <p className="font-black text-indigo-600">{formatCurrency(parseFloat(p.price))}</p>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50">
              <ShoppingCart className="w-20 h-20 stroke-[1]" />
              <p className="font-black uppercase tracking-widest text-xs">Carrito Vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group animate-in fade-in slide-in-from-left-2"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{formatCurrency(parseFloat(item.price))} / un.</p>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="w-10 text-center font-black text-sm">{item.cartQuantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="w-24 text-right">
                  <p className="font-black text-sm text-slate-900 dark:text-white">
                    {formatCurrency(parseFloat(item.price) * item.cartQuantity)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Totals & Checkout */}
      <div className="w-full md:w-[380px] flex flex-col bg-slate-100 dark:bg-slate-950 p-6 md:p-8 space-y-8">
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Resumen de Venta</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-sm font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(cartSubtotal)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Descuento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                  <Input 
                    type="number" 
                    value={discountAmount || ""} 
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="h-9 pl-6 text-sm font-bold text-emerald-600 bg-white dark:bg-slate-900 border-none rounded-lg"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Recargo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 font-bold">$</span>
                  <Input 
                    type="number" 
                    value={surchargeAmount || ""} 
                    onChange={(e) => setSurchargeAmount(parseFloat(e.target.value) || 0)}
                    className="h-9 pl-6 text-sm font-bold text-amber-600 bg-white dark:bg-slate-900 border-none rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-lg font-black">TOTAL</span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.length === 0 ? (
              <p className="col-span-2 text-[10px] text-slate-400 italic text-center py-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Configura medios de pago en Ajustes
              </p>
            ) : (
              paymentMethods.map((pm) => {
                const Icon = pm.type === 'cash' ? Banknote : pm.type === 'digital' ? Smartphone : CreditCard;
                return (
                  <Button
                    key={pm.id}
                    variant={selectedPaymentMethodId === pm.id ? 'default' : 'outline'}
                    className={`h-14 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all border-none shadow-sm ${
                      selectedPaymentMethodId === pm.id 
                        ? 'bg-indigo-600 text-white scale-[1.02] shadow-indigo-200 dark:shadow-none' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setSelectedPaymentMethodId(pm.id);
                      if (pm.type === 'cash') setSelectedTerminalId(null);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-wider truncate w-full text-center px-1">{pm.name}</span>
                  </Button>
                );
              })
            )}
          </div>

          {/* Dynamic Terminal Selection */}
          {selectedPaymentMethodId && paymentMethods.find(pm => pm.id === selectedPaymentMethodId)?.type !== 'cash' && terminals.length > 0 && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Terminal / Dispositivo</h2>
              <div className="grid grid-cols-2 gap-2">
                {terminals.filter(t => t.branchId === selectedBranchId).map((t) => (
                  <Button
                    key={t.id}
                    variant={selectedTerminalId === t.id ? 'default' : 'outline'}
                    className={`h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-none shadow-sm ${
                      selectedTerminalId === t.id 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white dark:bg-slate-900 text-slate-500'
                    }`}
                    onClick={() => setSelectedTerminalId(t.id)}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-wider truncate">{t.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4">
          <Button 
            className="w-full h-20 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-2xl shadow-emerald-200 dark:shadow-none flex items-center gap-4 transition-all active:scale-95 disabled:opacity-50"
            disabled={cart.length === 0 || isProcessingSale}
            onClick={handleCheckout}
          >
            {isProcessingSale ? (
              <span className="animate-pulse">Procesando...</span>
            ) : (
              <>
                <Calculator className="w-6 h-6" />
                COBRAR AHORA
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full h-12 text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest gap-2"
            onClick={() => { if(confirm('¿Cerrar turno y caja?')) closeShiftAction({ shiftId: currentShift.id, endCash: 0 }).then(() => setCurrentShift(null)) }}
          >
            Cerrar Turno
          </Button>
        </div>
      </div>
    </div>
  );
}
