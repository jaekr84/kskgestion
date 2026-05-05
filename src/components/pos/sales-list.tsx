"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Search, 
  Eye, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Store,
  User,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SalesList({ initialSales }: { initialSales: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const filteredSales = initialSales.filter(sale => 
    sale.id.toString().includes(search) ||
    sale.branch?.name.toLowerCase().includes(search.toLowerCase()) ||
    sale.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = initialSales.reduce((acc, s) => acc + parseFloat(s.total), 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Ventas</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{initialSales.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Facturación Total</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Promedio</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {initialSales.length > 0 ? formatCurrency(totalRevenue / initialSales.length) : "$0,00"}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID, sucursal o vendedor..."
          className="h-14 pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Venta ID</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha / Hora</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Sucursal</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Vendedor</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Pago</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((sale) => {
                const Icon = sale.paymentMethod?.type === 'cash' ? Banknote : sale.paymentMethod?.type === 'digital' ? Smartphone : CreditCard;
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">#{sale.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {format(new Date(sale.createdAt), "dd MMM yyyy", { locale: es })}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {format(new Date(sale.createdAt), "HH:mm 'hs'")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{sale.branch?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{sale.user?.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{sale.paymentMethod?.name || sale.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-lg text-slate-900 dark:text-white">
                        {formatCurrency(parseFloat(sale.total))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedSale && (
            <div className="flex flex-col">
              <div className="bg-indigo-600 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Ticket de Venta</p>
                    <DialogTitle className="text-3xl font-black text-white">#{selectedSale.id}</DialogTitle>
                    <p className="text-indigo-100 mt-2 flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(selectedSale.createdAt), "PPPP 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Cobrado</p>
                    <p className="text-4xl font-black">{formatCurrency(parseFloat(selectedSale.total))}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Sale Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sucursal</p>
                    <p className="font-bold flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-500" />
                      {selectedSale.branch?.name}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Vendedor</p>
                    <p className="font-bold flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      {selectedSale.user?.name}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Productos Vendidos</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
                    {selectedSale.items.map((item: any) => (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.product?.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity} x {formatCurrency(parseFloat(item.unitPrice))}</p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white">
                          {formatCurrency(parseFloat(item.subtotal))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">Subtotal</span>
                    <span className="font-bold">{formatCurrency(parseFloat(selectedSale.subtotal))}</span>
                  </div>
                  {parseFloat(selectedSale.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-bold">Descuento</span>
                      <span className="font-bold text-emerald-600">-{formatCurrency(parseFloat(selectedSale.discountAmount))}</span>
                    </div>
                  )}
                  {parseFloat(selectedSale.surchargeAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600 font-bold">Recargo</span>
                      <span className="font-bold text-amber-600">+{formatCurrency(parseFloat(selectedSale.surchargeAmount))}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-lg font-black">Total</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(parseFloat(selectedSale.total))}
                    </span>
                  </div>
                </div>

                {/* Payment Detail */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Medio de Pago</p>
                      <p className="font-black text-slate-900 dark:text-white uppercase">{selectedSale.paymentMethod?.name || selectedSale.paymentMethod}</p>
                    </div>
                  </div>
                  {selectedSale.terminal && (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Terminal</p>
                      <p className="font-black text-slate-900 dark:text-white uppercase">{selectedSale.terminal.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 pt-0 flex justify-end">
                <Button 
                  onClick={() => setSelectedSale(null)}
                  className="bg-indigo-600 text-white rounded-2xl px-10 h-12 font-bold"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
