"use client";

import { useState, useMemo } from "react";
import { Search, ShoppingCart, X, FileText, Calendar, Truck, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 25;

interface PurchasesTableProps {
  purchases: any[];
  suppliers: any[];
  branches: any[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  recibida: { label: "Recibida", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  cancelada: { label: "Cancelada", className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
};

export function PurchasesTable({ purchases, suppliers, branches }: PurchasesTableProps) {
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters = search || supplierFilter !== "all" || statusFilter !== "all";

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          purchase.invoiceNumber?.toLowerCase().includes(q) ||
          purchase.supplier?.name?.toLowerCase().includes(q) ||
          purchase.notes?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (supplierFilter !== "all") {
        if (String(purchase.supplierId) !== supplierFilter) return false;
      }

      if (statusFilter !== "all") {
        if (purchase.status !== statusFilter) return false;
      }

      return true;
    });
  }, [purchases, search, supplierFilter, statusFilter]);

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginatedPurchases = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPurchases.slice(start, start + PAGE_SIZE);
  }, [filteredPurchases, safePage]);

  const clearFilters = () => {
    setSearch("");
    setSupplierFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por factura o proveedor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <Select value={supplierFilter} onValueChange={handleFilterChange(setSupplierFilter)}>
            <SelectTrigger className="h-10 w-full sm:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proveedores</SelectItem>
              {suppliers.map((sup) => (
                <SelectItem key={sup.id} value={String(sup.id)}>
                  {sup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
            <SelectTrigger className="h-10 w-full sm:w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="recibida">Recibida</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 px-3 text-slate-500 hover:text-rose-600 gap-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Limpiar
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{filteredPurchases.length}</span>
            <span>de {purchases.length} compras</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-bold">Fecha</TableHead>
              <TableHead className="font-bold">Proveedor</TableHead>
              <TableHead className="font-bold">Factura</TableHead>
              <TableHead className="font-bold">Sucursal</TableHead>
              <TableHead className="font-bold text-center">Ítems</TableHead>
              <TableHead className="font-bold text-right">Total</TableHead>
              <TableHead className="font-bold text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPurchases.map((purchase) => {
              const status = statusConfig[purchase.status] || statusConfig.pendiente;
              const itemCount = purchase.items?.length || 0;
              return (
                <TableRow key={purchase.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(purchase.purchaseDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {purchase.supplier?.name || "Sin proveedor"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {purchase.invoiceNumber ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700 dark:text-slate-300">{purchase.invoiceNumber}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {purchase.branch?.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(parseFloat(purchase.total))}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] font-bold border ${status.className}`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedPurchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                    {hasActiveFilters ? (
                      <>
                        <p className="text-lg font-medium">No se encontraron resultados</p>
                        <p className="text-sm">Probá ajustando los filtros de búsqueda.</p>
                        <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 gap-2">
                          <X className="w-3.5 h-3.5" /> Limpiar filtros
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium">No hay compras registradas</p>
                        <p className="text-sm">Registrá tu primera compra a proveedor.</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredPurchases.length > PAGE_SIZE && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Mostrando {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filteredPurchases.length)} de {filteredPurchases.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 dark:border-slate-700"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === safePage ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 text-xs font-bold ${page === safePage ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border-slate-200 dark:border-slate-700"}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 dark:border-slate-700"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
