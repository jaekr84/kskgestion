import { pgTable, serial, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tenants: Each client of the SaaS
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  province: text("province"),
  city: text("city"),
  cuit: text("cuit"),
  taxCondition: text("tax_condition"), // Monotributo, Responsable Inscripto, Exento
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Branches: Each physical location of a tenant
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  province: text("province"),
  city: text("city"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roles: Per-tenant customizable roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(), // e.g., "Admin", "Vendedor"
  description: text("description"),
  permissions: text("permissions").notNull().default("[]"), // Array of module keys: ["dashboard", "pos", ...]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users: Staff members
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  roleId: integer("role_id").references(() => roles.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users to Branches: Many-to-many relationship for multi-branch access
export const usersToBranches = pgTable("users_to_branches", {
  userId: integer("user_id").references(() => users.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
}, (t) => ({
  pk: [t.userId, t.branchId],
}));

// Product Categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Methods: Cash, Credit Card, etc.
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(), // e.g., "Efectivo", "Tarjeta de Crédito"
  type: text("type").notNull(), // e.g., "cash", "card", "transfer", "digital"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Terminals: Posnet, QR, etc.
export const paymentTerminals = pgTable("payment_terminals", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(), // e.g., "Posnet 1", "QR Mercado Pago"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  cuit: text("cuit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products: Shared within a tenant but can have specific stock per branch
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  externalSku: text("external_sku"),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  markup: decimal("markup", { precision: 10, scale: 2 }).default("0"),
  iva: decimal("iva", { precision: 10, scale: 2 }).default("21"),
  priceIncludesIva: boolean("price_includes_iva").default(true),
  minStock: integer("min_stock").default(0),
  categoryId: integer("category_id").references(() => productCategories.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
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

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  branches: many(branches),
  users: many(users),
  roles: many(roles),
  productCategories: many(productCategories),
  suppliers: many(suppliers),
  paymentMethods: many(paymentMethods),
  paymentTerminals: many(paymentTerminals),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [branches.tenantId],
    references: [tenants.id],
  }),
  userAssignments: many(usersToBranches),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  branchAssignments: many(usersToBranches),
}));

export const usersToBranchesRelations = relations(usersToBranches, ({ one }) => ({
  user: one(users, {
    fields: [usersToBranches.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [usersToBranches.branchId],
    references: [branches.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [productCategories.tenantId],
    references: [tenants.id],
  }),
  products: many(products),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [paymentMethods.tenantId],
    references: [tenants.id],
  }),
  sales: many(sales),
}));

export const paymentTerminalsRelations = relations(paymentTerminals, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [paymentTerminals.tenantId],
    references: [tenants.id],
  }),
  branch: one(branches, {
    fields: [paymentTerminals.branchId],
    references: [branches.id],
  }),
  sales: many(sales),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [suppliers.tenantId],
    references: [tenants.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  inventory: many(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  branch: one(branches, {
    fields: [inventory.branchId],
    references: [branches.id],
  }),
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

// Purchases: Purchase orders from suppliers
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  branchId: integer("branch_id").references(() => branches.id),
  invoiceNumber: text("invoice_number"),       // Nro. de factura del proveedor
  status: text("status").notNull().default("pendiente"), // pendiente, recibida, cancelada
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  iva: decimal("iva", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Purchase Items: Line items within a purchase
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// Purchase Relations
export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [purchases.tenantId],
    references: [tenants.id],
  }),
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
  branch: one(branches, {
    fields: [purchases.branchId],
    references: [branches.id],
  }),
  items: many(purchaseItems),
  receptions: many(stockReceptions),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id],
  }),
  product: one(products, {
    fields: [purchaseItems.productId],
    references: [products.id],
  }),
}));

// Stock Receptions: Per-branch verification of received goods
export const stockReceptions = pgTable("stock_receptions", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  status: text("status").notNull().default("pendiente"), // pendiente, recibida, recibida_parcial, rechazada
  receivedByUserId: integer("received_by_user_id").references(() => users.id),
  notes: text("notes"),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stock Reception Items: Line items for each reception
export const stockReceptionItems = pgTable("stock_reception_items", {
  id: serial("id").primaryKey(),
  receptionId: integer("reception_id").references(() => stockReceptions.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  expectedQuantity: integer("expected_quantity").notNull(),
  receivedQuantity: integer("received_quantity"),   // null = not yet confirmed
  notes: text("notes"),                              // discrepancy notes
});

// Stock Reception Relations
export const stockReceptionsRelations = relations(stockReceptions, ({ one, many }) => ({
  purchase: one(purchases, {
    fields: [stockReceptions.purchaseId],
    references: [purchases.id],
  }),
  branch: one(branches, {
    fields: [stockReceptions.branchId],
    references: [branches.id],
  }),
  receivedByUser: one(users, {
    fields: [stockReceptions.receivedByUserId],
    references: [users.id],
  }),
  items: many(stockReceptionItems),
}));

export const stockReceptionItemsRelations = relations(stockReceptionItems, ({ one }) => ({
  reception: one(stockReceptions, {
    fields: [stockReceptionItems.receptionId],
    references: [stockReceptions.id],
  }),
  product: one(products, {
    fields: [stockReceptionItems.productId],
    references: [products.id],
  }),
}));

// Shifts: Cash drawer management
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  startCash: decimal("start_cash", { precision: 12, scale: 2 }).notNull().default("0"),
  endCash: decimal("end_cash", { precision: 12, scale: 2 }),
  expectedCash: decimal("expected_cash", { precision: 12, scale: 2 }).default("0"),
  status: text("status").notNull().default("open"), // open, closed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales: Transactions
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  shiftId: integer("shift_id").references(() => shifts.id).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  surchargeAmount: decimal("surcharge_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  terminalId: integer("terminal_id").references(() => paymentTerminals.id),
  paymentMethod: text("payment_method").notNull().default("cash"), // Legacy, for compatibility
  status: text("status").notNull().default("completed"), // completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sale Items: Products within a sale
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// POS Relations
export const shiftsRelations = relations(shifts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [shifts.tenantId],
    references: [tenants.id],
  }),
  branch: one(branches, {
    fields: [shifts.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [shifts.userId],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [sales.tenantId],
    references: [tenants.id],
  }),
  branch: one(branches, {
    fields: [sales.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  shift: one(shifts, {
    fields: [sales.shiftId],
    references: [shifts.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [sales.paymentMethodId],
    references: [paymentMethods.id],
  }),
  terminal: one(paymentTerminals, {
    fields: [sales.terminalId],
    references: [paymentTerminals.id],
  }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));
