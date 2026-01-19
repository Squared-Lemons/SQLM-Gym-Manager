import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { business, gym } from "./business";
import { gymMember } from "./members";

export const subscriptionPlan = sqliteTable("subscription_plan", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  gymId: text("gym_id")
    .references(() => gym.id, { onDelete: "cascade" }), // Optional, null = all gyms
  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  billingPeriod: text("billing_period", { enum: ["monthly", "quarterly", "yearly"] })
    .notNull()
    .default("monthly"),
  features: text("features"), // JSON array
  stripePriceId: text("stripe_price_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("subscription_plan_business_idx").on(table.businessId),
]);

export const payment = sqliteTable("payment", {
  id: text("id").primaryKey(),
  gymMemberId: text("gym_member_id")
    .notNull()
    .references(() => gymMember.id, { onDelete: "cascade" }),
  subscriptionPlanId: text("subscription_plan_id")
    .references(() => subscriptionPlan.id, { onDelete: "set null" }),
  amountInCents: integer("amount_in_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status", { enum: ["pending", "succeeded", "failed", "refunded"] })
    .notNull()
    .default("pending"),
  paymentMethod: text("payment_method", { enum: ["card", "cash", "bank_transfer", "other"] })
    .notNull()
    .default("card"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  description: text("description"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("payment_member_idx").on(table.gymMemberId),
  index("payment_status_idx").on(table.status),
]);

export const subscriptionPlanRelations = relations(subscriptionPlan, ({ one, many }) => ({
  business: one(business, {
    fields: [subscriptionPlan.businessId],
    references: [business.id],
  }),
  gym: one(gym, {
    fields: [subscriptionPlan.gymId],
    references: [gym.id],
  }),
  payments: many(payment),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  gymMember: one(gymMember, {
    fields: [payment.gymMemberId],
    references: [gymMember.id],
  }),
  subscriptionPlan: one(subscriptionPlan, {
    fields: [payment.subscriptionPlanId],
    references: [subscriptionPlan.id],
  }),
}));
