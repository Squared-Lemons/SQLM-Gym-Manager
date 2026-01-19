import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { gym } from "./business";
import { gymMember } from "./members";
import { trainer } from "./trainers";

export const ptPackage = sqliteTable("pt_package", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gym.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sessionCount: integer("session_count").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  validityDays: integer("validity_days").notNull().default(90), // Days to use sessions
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("pt_package_gym_idx").on(table.gymId),
]);

// Member's purchased PT package
export const memberPtPackage = sqliteTable("member_pt_package", {
  id: text("id").primaryKey(),
  gymMemberId: text("gym_member_id")
    .notNull()
    .references(() => gymMember.id, { onDelete: "cascade" }),
  ptPackageId: text("pt_package_id")
    .notNull()
    .references(() => ptPackage.id, { onDelete: "cascade" }),
  trainerId: text("trainer_id")
    .references(() => trainer.id, { onDelete: "set null" }),
  sessionsRemaining: integer("sessions_remaining").notNull(),
  purchasedAt: integer("purchased_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  status: text("status", { enum: ["active", "expired", "completed"] })
    .notNull()
    .default("active"),
}, (table) => [
  index("member_pt_package_member_idx").on(table.gymMemberId),
  index("member_pt_package_trainer_idx").on(table.trainerId),
]);

export const ptSession = sqliteTable("pt_session", {
  id: text("id").primaryKey(),
  memberPtPackageId: text("member_pt_package_id")
    .notNull()
    .references(() => memberPtPackage.id, { onDelete: "cascade" }),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => trainer.id, { onDelete: "cascade" }),
  gymMemberId: text("gym_member_id")
    .notNull()
    .references(() => gymMember.id, { onDelete: "cascade" }),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  status: text("status", { enum: ["scheduled", "completed", "cancelled", "no_show"] })
    .notNull()
    .default("scheduled"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("pt_session_member_idx").on(table.gymMemberId),
  index("pt_session_trainer_idx").on(table.trainerId),
  index("pt_session_scheduled_idx").on(table.scheduledAt),
]);

export const ptPackageRelations = relations(ptPackage, ({ one, many }) => ({
  gym: one(gym, {
    fields: [ptPackage.gymId],
    references: [gym.id],
  }),
  memberPackages: many(memberPtPackage),
}));

export const memberPtPackageRelations = relations(memberPtPackage, ({ one, many }) => ({
  gymMember: one(gymMember, {
    fields: [memberPtPackage.gymMemberId],
    references: [gymMember.id],
  }),
  ptPackage: one(ptPackage, {
    fields: [memberPtPackage.ptPackageId],
    references: [ptPackage.id],
  }),
  trainer: one(trainer, {
    fields: [memberPtPackage.trainerId],
    references: [trainer.id],
  }),
  sessions: many(ptSession),
}));

export const ptSessionRelations = relations(ptSession, ({ one }) => ({
  memberPtPackage: one(memberPtPackage, {
    fields: [ptSession.memberPtPackageId],
    references: [memberPtPackage.id],
  }),
  trainer: one(trainer, {
    fields: [ptSession.trainerId],
    references: [trainer.id],
  }),
  gymMember: one(gymMember, {
    fields: [ptSession.gymMemberId],
    references: [gymMember.id],
  }),
}));
