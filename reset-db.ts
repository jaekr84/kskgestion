import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function resetDb() {
  try {
    console.log("Iniciando reseteo de base de datos...");
    
    // Lista de tablas en orden inverso de dependencia para evitar errores de Foreign Key
    const tables = [
      'sale_items',
      'sales',
      'shifts',
      'stock_reception_items',
      'stock_receptions',
      'purchase_items',
      'purchases',
      'inventory',
      'products',
      'users',
      'roles',
      'branches',
      'tenants'
    ];

    for (const table of tables) {
      console.log(`Borrando datos de tabla: ${table}`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`));
    }

    console.log("\n¡Base de datos reseteada con éxito!");
    console.log("Todas las tablas están vacías y los contadores (IDs) volvieron a 1.");
  } catch (e) {
    console.error("Error al resetear base de datos:", e);
  }
  process.exit(0);
}

resetDb();
