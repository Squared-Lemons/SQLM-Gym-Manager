import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { gym } from "./business";
import { gymMember } from "./members";
import { trainer } from "./trainers";

export const classType = sqliteTable("class_type", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gym.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  maxCapacity: integer("max_capacity").notNull().default(20),
  color: text("color").default("#3b82f6"), // Default blue color for calendar
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const classSchedule = sqliteTable("class_schedule", {
  id: text("id").primaryKey(),
  classTypeId: text("class_type_id")
    .notNull()
    .references(() => classType.id, { onDelete: "cascade" }),
  gymId: text("gym_id")
    .notNull()
    .references(() => gym.id, { onDelete: "cascade" }),
  instructorId: text("instructor_id")
    .references(() => trainer.id, { onDelete: "set null" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "10:00"
  room: text("room"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("class_schedule_gym_idx").on(table.gymId),
  index("class_schedule_day_idx").on(table.dayOfWeek),
]);

export const classBooking = sqliteTable("class_booking", {
  id: text("id").primaryKey(),
  classScheduleId: text("class_schedule_id")
    .notNull()
    .references(() => classSchedule.id, { onDelete: "cascade" }),
  gymMemberId: text("gym_member_id")
    .notNull()
    .references(() => gymMember.id, { onDelete: "cascade" }),
  classDate: integer("class_date", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["booked", "attended", "cancelled", "no_show"] })
    .notNull()
    .default("booked"),
  bookedAt: integer("booked_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
}, (table) => [
  index("class_booking_schedule_idx").on(table.classScheduleId),
  index("class_booking_member_idx").on(table.gymMemberId),
  index("class_booking_date_idx").on(table.classDate),
]);

export const classTypeRelations = relations(classType, ({ one, many }) => ({
  gym: one(gym, {
    fields: [classType.gymId],
    references: [gym.id],
  }),
  schedules: many(classSchedule),
}));

export const classScheduleRelations = relations(classSchedule, ({ one, many }) => ({
  classType: one(classType, {
    fields: [classSchedule.classTypeId],
    references: [classType.id],
  }),
  gym: one(gym, {
    fields: [classSchedule.gymId],
    references: [gym.id],
  }),
  instructor: one(trainer, {
    fields: [classSchedule.instructorId],
    references: [trainer.id],
  }),
  bookings: many(classBooking),
}));

export const classBookingRelations = relations(classBooking, ({ one }) => ({
  classSchedule: one(classSchedule, {
    fields: [classBooking.classScheduleId],
    references: [classSchedule.id],
  }),
  gymMember: one(gymMember, {
    fields: [classBooking.gymMemberId],
    references: [gymMember.id],
  }),
}));
