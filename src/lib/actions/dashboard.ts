"use server";

import { db } from "@/db";
import { sales, saleItems, products, branches } from "@/db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { getTenantId } from "./tenants";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getDashboardStatsAction() {
  try {
    const tenantId = await getTenantId();
    const today = startOfDay(new Date());
    const yesterday = startOfDay(subDays(today, 1));
    const tomorrow = endOfDay(today);

    // 1. Sales Today
    const todaySales = await db.query.sales.findMany({
      where: and(
        eq(sales.tenantId, tenantId),
        gte(sales.createdAt, today),
        lt(sales.createdAt, tomorrow)
      ),
    });

    // 2. Sales Yesterday
    const yesterdaySales = await db.query.sales.findMany({
      where: and(
        eq(sales.tenantId, tenantId),
        gte(sales.createdAt, yesterday),
        lt(sales.createdAt, today)
      ),
    });

    const todayTotal = todaySales.reduce((acc, s) => acc + parseFloat(s.total), 0);
    const yesterdayTotal = yesterdaySales.reduce((acc, s) => acc + parseFloat(s.total), 0);
    const growth = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 100;

    // 3. Top Products (last 7 days)
    const sevenDaysAgo = subDays(today, 7);
    const topProductsRaw = await db.execute(sql`
      SELECT p.name, SUM(si.quantity) as total_quantity
      FROM ${saleItems} si
      JOIN ${sales} s ON si.sale_id = s.id
      JOIN ${products} p ON si.product_id = p.id
      WHERE s.tenant_id = ${tenantId} AND s.created_at >= ${sevenDaysAgo}
      GROUP BY p.name
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

    // 4. Sales by Branch
    const branchSalesRaw = await db.execute(sql`
      SELECT b.name, SUM(s.total) as total_sales
      FROM ${sales} s
      JOIN ${branches} b ON s.branch_id = b.id
      WHERE s.tenant_id = ${tenantId} AND s.created_at >= ${sevenDaysAgo}
      GROUP BY b.name
      ORDER BY total_sales DESC
    `);

    // 5. Hourly Sales (Today)
    const hourlySales = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, total: 0 }));
    todaySales.forEach(s => {
      const hour = new Date(s.createdAt).getHours();
      hourlySales[hour].total += parseFloat(s.total);
    });

    return {
      success: true,
      stats: {
        todayTotal,
        yesterdayTotal,
        growth,
        todayCount: todaySales.length,
        topProducts: topProductsRaw.rows,
        branchSales: branchSalesRaw.rows,
        hourlySales
      }
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return { success: false, error: "No se pudieron obtener las estadísticas" };
  }
}
