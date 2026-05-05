import { db } from "@/db";
import { branches, products, productCategories, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantId } from "@/lib/actions/tenants";
import { ProductForm } from "@/components/inventory/product-form";
import { Package, Search, Filter, Barcode, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function InventoryPage() {
  const tenantId = await getTenantId();

  const [allProducts, allBranches, allCategories, allSuppliers] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.tenantId, tenantId),
      with: {
        inventory: true,
      },
    }),
    db.query.branches.findMany({
      where: eq(branches.tenantId, tenantId),
    }),
    db.query.productCategories.findMany({
      where: eq(productCategories.tenantId, tenantId),
    }),
    db.query.suppliers.findMany({
      where: eq(suppliers.tenantId, tenantId),
    }),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="w-10 h-10 text-indigo-600" />
            Inventario
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Administra tus productos, precios y niveles de stock.
          </p>
        </div>
        <ProductForm branches={allBranches} categories={allCategories} suppliers={allSuppliers} />
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input placeholder="Buscar por nombre, SKU o código..." className="pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-2 h-10 px-4 border-slate-200 dark:border-slate-800">
                <Filter className="w-4 h-4" /> Filtros
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-bold">Producto</TableHead>
                  <TableHead className="font-bold">SKU / Código</TableHead>
                  <TableHead className="font-bold">Precio</TableHead>
                  <TableHead className="font-bold">Stock Total</TableHead>
                  <TableHead className="font-bold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProducts.map((product) => {
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
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`font-bold ${totalStock <= 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {totalStock} unidades
                          </span>
                          <div className="flex gap-1">
                            {product.inventory?.map((inv: any) => {
                              const branch = allBranches.find(b => b.id === inv.branchId);
                              return (
                                <div key={inv.id} title={`${branch?.name}: ${inv.stock}`} className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                              );
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ProductForm branches={allBranches} categories={allCategories} suppliers={allSuppliers} product={product} />
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {allProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Package className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No hay productos en el inventario</p>
                        <p className="text-sm">Comienza agregando tu primer artículo.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
