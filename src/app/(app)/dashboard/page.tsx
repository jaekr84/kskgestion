import { getDashboardStatsAction } from "@/lib/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const { stats } = await getDashboardStatsAction();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
            <LayoutDashboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Resumen general de tu actividad y rendimiento comercial.
        </p>
      </div>

      <DashboardClient stats={stats} />
    </div>
  );
}
