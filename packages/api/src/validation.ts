import { z } from "zod";

// Business validation schemas
export const createBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

// Gym validation schemas
export const createGymSchema = z.object({
  name: z.string().min(1, "Gym name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  facilities: z.array(z.string()).optional(),
});

export type CreateGymInput = z.infer<typeof createGymSchema>;

export const updateGymSchema = createGymSchema.partial();
export type UpdateGymInput = z.infer<typeof updateGymSchema>;

// Member validation schemas
export const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export const updateMemberSchema = createMemberSchema.partial();
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

// Class validation schemas
export const createClassTypeSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  durationMinutes: z.number().min(1).default(60),
  maxCapacity: z.number().min(1).default(20),
  color: z.string().optional(),
});

export type CreateClassTypeInput = z.infer<typeof createClassTypeSchema>;

export const createClassScheduleSchema = z.object({
  classTypeId: z.string().min(1, "Class type is required"),
  instructorId: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  room: z.string().optional(),
});

export type CreateClassScheduleInput = z.infer<typeof createClassScheduleSchema>;

// Trainer validation schemas
export const createTrainerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  hourlyRate: z.number().optional(),
});

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;

// PT Package validation schemas
export const createPTPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().optional(),
  sessionCount: z.number().min(1, "Must have at least 1 session"),
  priceInCents: z.number().min(0),
  validityDays: z.number().min(1).default(90),
});

export type CreatePTPackageInput = z.infer<typeof createPTPackageSchema>;

// Subscription plan validation schemas
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  priceInCents: z.number().min(0),
  billingPeriod: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  features: z.array(z.string()).optional(),
  gymId: z.string().optional(),
});

export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>;
