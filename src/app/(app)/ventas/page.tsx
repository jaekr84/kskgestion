import { getSalesAction } from "@/lib/actions/sales";
import { SalesList } from "@/components/pos/sales-list";
import { Receipt } from "lucide-react";

export default async function VentasPage() {
  const sales = await getSalesAction();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
            <Receipt className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          Historial de Ventas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Revisa y audita todas las operaciones realizadas en el punto de venta.
        </p>
      </div>

      <SalesList initialSales={sales} />
    </div>
  );
}
