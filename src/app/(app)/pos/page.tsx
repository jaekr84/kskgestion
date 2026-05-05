import { db } from "@/db";
import { products, branches as branchesTable, paymentMethods, paymentTerminals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantId } from "@/lib/actions/tenants";
import { POSContainer } from "@/components/pos/pos-container";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function POSPage() {
  const tenantId = await getTenantId();
  
  // For now, we'll get branches and products. 
  // In a real app, we'd also get the current user from session.
  // Assuming tenantId is enough for now to list products.
  
  const allProducts = await db.query.products.findMany({
    where: eq(products.tenantId, tenantId),
    with: {
      inventory: true,
      category: true,
    }
  });

  const branches = await db.query.branches.findMany({
    where: eq(branchesTable.tenantId, tenantId),
  });

  const allPaymentMethods = await db.query.paymentMethods.findMany({
    where: and(eq(paymentMethods.tenantId, tenantId), eq(paymentMethods.isActive, true)),
  });

  const allTerminals = await db.query.paymentTerminals.findMany({
    where: and(eq(paymentTerminals.tenantId, tenantId), eq(paymentTerminals.isActive, true)),
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen overflow-hidden">
      <POSContainer 
        initialProducts={allProducts} 
        branches={branches}
        paymentMethods={allPaymentMethods}
        terminals={allTerminals}
        tenantId={tenantId}
      />
    </div>
  );
}
