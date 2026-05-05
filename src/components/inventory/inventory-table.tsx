"use client";

import { useState, useMemo } from "react";
import { Search, Barcode, Package, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductForm } from "./product-form";

interface InventoryTableProps {
  products: any[];
  branches: any[];
  categories: any[];
  suppliers: any[];
}

export function InventoryTable({ products, branches, categories, suppliers }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  const hasActiveFilters = search || categoryFilter !== "all" || supplierFilter !== "all";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          product.name?.toLowerCase().includes(q) ||
          product.sku?.toLowerCase().includes(q) ||
          product.externalSku?.toLowerCase().includes(q) ||
          product.barcode?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== "all") {
        if (String(product.categoryId) !== categoryFilter) return false;
      }

      // Supplier filter
      if (supplierFilter !== "all") {
        if (String(product.supplierId) !== supplierFilter) return false;
      }

      return true;
    });
  }, [products, search, categoryFilter, supplierFilter]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setSupplierFilter("all");
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, SKU o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
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

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{filteredProducts.length}</span>
            <span>de {products.length} productos</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-bold">Producto</TableHead>
              <TableHead className="font-bold">SKU / Código</TableHead>
              <TableHead className="font-bold">Precio</TableHead>
              {branches.map(branch => (
                <TableHead key={branch.id} className="font-bold text-center text-[10px] uppercase tracking-wider text-slate-400">
                  {branch.name}
                </TableHead>
              ))}
              <TableHead className="font-bold">Stock Total</TableHead>
              <TableHead className="font-bold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const inventory = (product as any).inventory || [];
              const totalStock = inventory.reduce((acc: number, inv: any) => acc + (inv.stock || 0), 0);
              return (
                <TableRow key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </span>
                      <span className="text-xs text-slate-500 line-clamp-1">{product.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {product.sku && <Badge variant="secondary" className="w-fit text-[10px] uppercase font-bold">{product.sku}</Badge>}
                      {product.barcode && <span className="text-xs text-slate-400 flex items-center gap-1"><Barcode className="w-3 h-3" /> {product.barcode}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-indigo-600 dark:text-indigo-400">${product.price}</span>
                      {product.cost && <span className="text-[10px] text-slate-400 uppercase font-bold">Costo: ${product.cost}</span>}
                    </div>
                  </TableCell>
                  {branches.map(branch => {
                    const branchStock = inventory.find((inv: any) => inv.branchId === branch.id)?.stock || 0;
                    return (
                      <TableCell key={branch.id} className="text-center font-medium text-slate-600 dark:text-slate-400">
                        {branchStock}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold ${totalStock <= (product.minStock || 5) ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {totalStock} uds.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ProductForm branches={branches} categories={categories} suppliers={suppliers} product={product} />
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5 + branches.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Package className="w-12 h-12 mb-4 opacity-20" />
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
                        <p className="text-lg font-medium">No hay productos en el inventario</p>
                        <p className="text-sm">Comienza agregando tu primer artículo.</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
