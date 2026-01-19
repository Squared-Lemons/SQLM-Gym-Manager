import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { organization } from "./organizations";

export const business = sqliteTable("business", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const gym = sqliteTable("gym", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  openingHours: text("opening_hours"), // JSON string
  facilities: text("facilities"), // JSON string array
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const businessRelations = relations(business, ({ one, many }) => ({
  organization: one(organization, {
    fields: [business.organizationId],
    references: [organization.id],
  }),
  gyms: many(gym),
}));

export const gymRelations = relations(gym, ({ one }) => ({
  business: one(business, {
    fields: [gym.businessId],
    references: [business.id],
  }),
}));
