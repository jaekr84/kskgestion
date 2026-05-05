import { db } from "./src/db";
import { users } from "./src/db/schema";

async function listUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log("\n--- Usuarios en la base de datos ---");
    if (allUsers.length === 0) {
      console.log("No hay usuarios registrados.");
    } else {
      console.table(allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));
    }
  } catch (e) {
    console.error("Error al leer la base de datos:", e);
  }
  process.exit(0);
}

listUsers();
