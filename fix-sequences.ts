import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function fixSequences() {
  try {
    console.log("Sincronizando secuencias...");
    
    // Lista de tablas con IDs serial
    const tables = [
      'tenants', 
      'branches', 
      'roles', 
      'users', 
      'products', 
      'inventory', 
      'purchases', 
      'purchase_items',
      'stock_receptions',
      'stock_reception_items',
      'shifts',
      'sales',
      'sale_items'
    ];

    for (const table of tables) {
      const sequenceName = `${table}_id_seq`;
      console.log(`Corrigiendo secuencia: ${sequenceName}`);
      await db.execute(sql.raw(`SELECT setval('${sequenceName}', (SELECT COALESCE(MAX(id), 0) + 1 FROM ${table}), false)`));
    }

    console.log("¡Secuencias sincronizadas con éxito!");
  } catch (e) {
    console.error("Error al sincronizar secuencias:", e);
  }
  process.exit(0);
}

fixSequences();
