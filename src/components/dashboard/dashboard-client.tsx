"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Store, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

export function DashboardClient({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-black ${stats.growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {stats.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(stats.growth).toFixed(1)}%
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ventas de Hoy</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.todayTotal)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Operaciones Hoy</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.todayCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ventas Ayer</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.yesterdayTotal)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Promedio</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.todayCount > 0 ? formatCurrency(stats.todayTotal / stats.todayCount) : "$0,00"}
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hourly Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Flujo de Ventas (Hoy)
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 800 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  formatter={(value: any) => [formatCurrency(value), "Ventas"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">
            Top 5 Productos (7d)
          </h3>
          <div className="space-y-6 flex-1">
            {stats.topProducts.map((p: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate pr-4">{p.name}</p>
                  <p className="text-xs font-black text-indigo-600">{p.total_quantity} u.</p>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(p.total_quantity / stats.topProducts[0].total_quantity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
                <Package className="w-12 h-12" />
                <p className="text-sm font-bold">Sin datos de ventas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">
          Ventas por Sucursal (7d)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.branchSales.map((b: any, idx: number) => (
            <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <Store className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{b.name}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(parseFloat(b.total_sales))}</p>
              </div>
            </div>
          ))}
          {stats.branchSales.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
              <Store className="w-12 h-12" />
              <p className="text-sm font-bold">Sin sucursales registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
