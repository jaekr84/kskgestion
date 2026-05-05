import { db } from "@/db";
import { branches, products, purchases, suppliers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/actions/tenants";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { PurchasesTable } from "@/components/purchases/purchases-table";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function ComprasPage() {
  const tenantId = await getTenantId();

  const [allPurchases, allBranches, allProducts, allSuppliers] = await Promise.all([
    db.query.purchases.findMany({
      where: eq(purchases.tenantId, tenantId),
      with: {
        supplier: true,
        branch: true,
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(purchases.purchaseDate)],
    }),
    db.query.branches.findMany({
      where: eq(branches.tenantId, tenantId),
    }),
    db.query.products.findMany({
      where: eq(products.tenantId, tenantId),
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
            <ShoppingCart className="w-10 h-10 text-indigo-600" />
            Compras
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Registra y controla las compras a proveedores.
          </p>
        </div>
        <PurchaseForm branches={allBranches} products={allProducts} suppliers={allSuppliers} />
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <PurchasesTable
            purchases={allPurchases}
            suppliers={allSuppliers}
            branches={allBranches}
          />
        </CardContent>
      </Card>
    </div>
  );
}
