import { db } from "../src/db";
import { users } from "../src/db/schema";

async function listUsers() {
  const allUsers = await db.select().from(users);
  console.log("Usuarios en la base de datos:");
  console.table(allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));
  process.exit(0);
}

listUsers();
