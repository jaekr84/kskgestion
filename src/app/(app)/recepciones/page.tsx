import { db } from "@/db";
import { branches, stockReceptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/actions/tenants";
import { ReceptionsTable } from "@/components/receptions/receptions-table";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function RecepcionesPage() {
  const tenantId = await getTenantId();

  const [allBranches, allReceptions] = await Promise.all([
    db.query.branches.findMany({
      where: eq(branches.tenantId, tenantId),
    }),
    db.query.stockReceptions.findMany({
      with: {
        purchase: {
          with: {
            supplier: true,
            tenant: true,
          },
        },
        branch: true,
        receivedByUser: true,
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(stockReceptions.createdAt)],
    }),
  ]);

  // Filter receptions by tenant
  const tenantReceptions = allReceptions.filter(r => r.purchase.tenantId === tenantId);
  const pendingCount = tenantReceptions.filter(r => r.status === "pendiente").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-10 h-10 text-emerald-600" />
            Recepciones
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-black shadow-lg shadow-amber-200 dark:shadow-none animate-in zoom-in-50 duration-300">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Verificá y confirmá la mercadería recibida en cada sucursal.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <ReceptionsTable receptions={tenantReceptions} branches={allBranches} />
        </CardContent>
      </Card>
    </div>
  );
}
