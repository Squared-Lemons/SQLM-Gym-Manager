import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { gym } from "./business";
import { user } from "./auth";

export const trainer = sqliteTable("trainer", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "set null" }),
  gymId: text("gym_id")
    .notNull()
    .references(() => gym.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  specialties: text("specialties"), // JSON array
  certifications: text("certifications"), // JSON array
  hourlyRate: integer("hourly_rate"), // In cents
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("trainer_gym_idx").on(table.gymId),
  index("trainer_user_idx").on(table.userId),
]);

export const trainerAvailability = sqliteTable("trainer_availability", {
  id: text("id").primaryKey(),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => trainer.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("trainer_availability_trainer_idx").on(table.trainerId),
]);

export const trainerRelations = relations(trainer, ({ one, many }) => ({
  user: one(user, {
    fields: [trainer.userId],
    references: [user.id],
  }),
  gym: one(gym, {
    fields: [trainer.gymId],
    references: [gym.id],
  }),
  availability: many(trainerAvailability),
}));

export const trainerAvailabilityRelations = relations(trainerAvailability, ({ one }) => ({
  trainer: one(trainer, {
    fields: [trainerAvailability.trainerId],
    references: [trainer.id],
  }),
}));
