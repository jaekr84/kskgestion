import { pgTable, serial, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";

// Tenants: Each client of the SaaS
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Branches: Each physical location of a tenant
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users: Staff members
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("staff").notNull(), // admin, manager, staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products: Shared within a tenant but can have specific stock per branch
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  categoryId: integer("category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory: Stock per product and branch
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  stock: integer("stock").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
