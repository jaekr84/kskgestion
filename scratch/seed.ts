import { db } from "../src/db";
import { tenants, branches, roles, users } from "../src/db/schema";

async function seed() {
  console.log("Iniciando carga de datos iniciales...");

  // 1. Crear Tenant
  const [tenant] = await db.insert(tenants).values({
    name: "Empresa de Prueba",
    slug: "demo",
    email: "demo@example.com",
  }).returning();
  console.log("Tenant creado ID:", tenant.id);

  // 2. Crear Sucursal
  const [branch] = await db.insert(branches).values({
    tenantId: tenant.id,
    name: "Sucursal Central",
    isActive: true,
  }).returning();
  console.log("Sucursal creada ID:", branch.id);

  // 3. Crear Rol Admin
  const [role] = await db.insert(roles).values({
    tenantId: tenant.id,
    name: "Administrador",
    description: "Acceso total al sistema",
    permissions: JSON.stringify(["dashboard", "pos", "compras", "recepciones", "inventario", "configuracion", "usuarios"]),
  }).returning();
  console.log("Rol Administrador creado ID:", role.id);

  // 4. Crear Usuario
  const [user] = await db.insert(users).values({
    tenantId: tenant.id,
    roleId: role.id,
    name: "Admin Demo",
    email: "admin@demo.com",
  }).returning();
  console.log("Usuario Admin creado ID:", user.id);

  console.log("\n¡Datos iniciales cargados con éxito!");
  console.log("IMPORTANTE: El ID del Tenant es", tenant.id, "y el ID de la Sucursal es", branch.id);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en el seed:", err);
  process.exit(1);
});
