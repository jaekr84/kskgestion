"use client";

import { useState, useMemo } from "react";
import { Search, ClipboardCheck, X, Calendar, Truck, MapPin, ChevronLeft, ChevronRight, PackageCheck, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ReceptionConfirmForm } from "@/components/receptions/reception-confirm-form";

const PAGE_SIZE = 25;

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  recibida: { label: "Recibida", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  recibida_parcial: { label: "Parcial", className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20" },
  rechazada: { label: "Rechazada", className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
};

export function ReceptionsTable({ receptions, branches }: { receptions: any[]; branches: any[] }) {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReception, setSelectedReception] = useState<any>(null);

  const hasActiveFilters = search || branchFilter !== "all" || statusFilter !== "all";

  const filtered = useMemo(() => {
    return receptions.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          r.purchase?.supplier?.name?.toLowerCase().includes(q) ||
          r.purchase?.invoiceNumber?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (branchFilter !== "all" && String(r.branchId) !== branchFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [receptions, search, branchFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const clearFilters = () => {
    setSearch("");
    setBranchFilter("all");
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
              placeholder="Buscar por proveedor o factura..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
          <Select value={branchFilter} onValueChange={handleFilterChange(setBranchFilter)}>
            <SelectTrigger className="h-10 w-full sm:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm">
              <SelectValue placeholder="Sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sucursales</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
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
              <SelectItem value="recibida_parcial">Parcial</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 px-3 text-slate-500 hover:text-rose-600 gap-1.5 shrink-0">
              <X className="w-3.5 h-3.5" /> Limpiar
            </Button>
          )}
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{filtered.length}</span> de {receptions.length} recepciones
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
              <TableHead className="font-bold text-center">Obs.</TableHead>
              <TableHead className="font-bold text-center">Estado</TableHead>
              <TableHead className="font-bold text-center">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((reception) => {
              const status = statusConfig[reception.status] || statusConfig.pendiente;
              const itemCount = reception.items?.length || 0;
              
              // Calculate total discrepancy
              let totalDiff = 0;
              let hasProcessedItems = false;
              reception.items?.forEach((item: any) => {
                if (item.receivedQuantity !== null) {
                  totalDiff += (item.receivedQuantity - item.expectedQuantity);
                  hasProcessedItems = true;
                }
              });

              return (
                <TableRow key={reception.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(reception.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {reception.purchase?.supplier?.name || "Sin proveedor"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {reception.purchase?.invoiceNumber ? (
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{reception.purchase.invoiceNumber}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {reception.branch?.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-xs">
                    {!hasProcessedItems ? (
                      <span className="text-slate-400">—</span>
                    ) : totalDiff === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">OK</span>
                    ) : totalDiff > 0 ? (
                      <span className="text-indigo-600 dark:text-indigo-400">+{totalDiff}</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">{totalDiff}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] font-bold border ${status.className}`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {reception.status === "pendiente" ? (
                      <Button
                        size="sm"
                        onClick={() => setSelectedReception(reception)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 gap-1.5 text-xs font-bold"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Recibir
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReception(reception)}
                        className="h-8 px-3 gap-1.5 text-xs text-slate-500"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <ClipboardCheck className="w-12 h-12 mb-4 opacity-20" />
                    {hasActiveFilters ? (
                      <>
                        <p className="text-lg font-medium">No se encontraron resultados</p>
                        <p className="text-sm">Probá ajustando los filtros.</p>
                        <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 gap-2">
                          <X className="w-3.5 h-3.5" /> Limpiar filtros
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium">No hay recepciones</p>
                        <p className="text-sm">Las recepciones se generan al crear compras con &quot;Requiere Recepción&quot;.</p>
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
      {filtered.length > PAGE_SIZE && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Mostrando {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === safePage ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 text-xs font-bold ${page === safePage ? "bg-indigo-600 text-white" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm/View Modal */}
      {selectedReception && (
        <ReceptionConfirmForm
          reception={selectedReception}
          open={!!selectedReception}
          onOpenChange={(open: boolean) => { if (!open) setSelectedReception(null); }}
        />
      )}
    </>
  );
}
