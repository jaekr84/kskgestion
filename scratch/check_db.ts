
import { db } from "../src/db";
import { productCategories, suppliers } from "../src/db/schema";

async function checkTables() {
  try {
    const cats = await db.select().from(productCategories).limit(1);
    const sups = await db.select().from(suppliers).limit(1);
    console.log("Tables exist and are accessible.");
  } catch (error) {
    console.error("Error accessing tables:", error);
  }
}

checkTables();
