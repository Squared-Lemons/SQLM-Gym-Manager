import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { gym } from "./business";
import { user } from "./auth";

// Gym member - a person with a gym membership (different from org member)
export const gymMember = sqliteTable("gym_member", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gym.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  // Member details (can exist without a user account)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  // Membership info
  memberNumber: text("member_number").notNull(),
  qrCode: text("qr_code").notNull(),
  subscriptionPlanId: text("subscription_plan_id"),
  status: text("status", { enum: ["active", "inactive", "suspended", "cancelled"] })
    .notNull()
    .default("active"),
  joinDate: integer("join_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  expiryDate: integer("expiry_date", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("gym_member_gym_idx").on(table.gymId),
  index("gym_member_user_idx").on(table.userId),
  index("gym_member_qr_idx").on(table.qrCode),
]);

export const checkIn = sqliteTable("check_in", {
  id: text("id").primaryKey(),
  gymMemberId: text("gym_member_id")
    .notNull()
    .references(() => gymMember.id, { onDelete: "cascade" }),
  gymId: text("gym_id")
    .notNull()
    .references(() => gym.id, { onDelete: "cascade" }),
  checkedInAt: integer("checked_in_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  checkedOutAt: integer("checked_out_at", { mode: "timestamp" }),
}, (table) => [
  index("check_in_member_idx").on(table.gymMemberId),
  index("check_in_gym_idx").on(table.gymId),
]);

export const gymMemberRelations = relations(gymMember, ({ one, many }) => ({
  gym: one(gym, {
    fields: [gymMember.gymId],
    references: [gym.id],
  }),
  user: one(user, {
    fields: [gymMember.userId],
    references: [user.id],
  }),
  checkIns: many(checkIn),
}));

export const checkInRelations = relations(checkIn, ({ one }) => ({
  gymMember: one(gymMember, {
    fields: [checkIn.gymMemberId],
    references: [gymMember.id],
  }),
  gym: one(gym, {
    fields: [checkIn.gymId],
    references: [gym.id],
  }),
}));
