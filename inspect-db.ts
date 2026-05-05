import { db } from "./src/db";
import { tenants, users, roles, branches } from "./src/db/schema";

async function inspectDb() {
  try {
    const allTenants = await db.select().from(tenants);
    const allUsers = await db.select().from(users);
    const allRoles = await db.select().from(roles);
    const allBranches = await db.select().from(branches);

    console.log("\n--- TENANTS ---");
    console.table(allTenants.map(t => ({ id: t.id, name: t.name, slug: t.slug })));

    console.log("\n--- USERS ---");
    console.table(allUsers.map(u => ({ id: u.id, email: u.email, tenantId: u.tenantId })));

    console.log("\n--- ROLES ---");
    console.table(allRoles.map(r => ({ id: r.id, name: r.name, tenantId: r.tenantId })));

  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

inspectDb();
