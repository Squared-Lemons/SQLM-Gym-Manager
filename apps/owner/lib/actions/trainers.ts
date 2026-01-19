"use server";

import { headers } from "next/headers";
import { db, trainer, trainerAvailability } from "@app/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireSession, requireOrganization, requireBusiness, getGymsForBusiness } from "@app/api";
import { createTrainerSchema, type CreateTrainerInput } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getTrainers() {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);
  const gyms = await getGymsForBusiness(biz.id);

  if (gyms.length === 0) return [];

  const gymIds = gyms.map((g) => g.id);
  const trainers = await db.query.trainer.findMany({
    orderBy: (trainer, { asc }) => [asc(trainer.lastName), asc(trainer.firstName)],
  });

  return trainers.filter((t) => gymIds.includes(t.gymId));
}

export async function getTrainersForGym(gymId: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.trainer.findMany({
    where: eq(trainer.gymId, gymId),
    orderBy: (trainer, { asc }) => [asc(trainer.lastName), asc(trainer.firstName)],
  });
}

export async function createTrainer(gymId: string, data: CreateTrainerInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const validated = createTrainerSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.insert(trainer).values({
    id: nanoid(),
    gymId,
    firstName: validated.data.firstName,
    lastName: validated.data.lastName,
    email: validated.data.email || null,
    phone: validated.data.phone || null,
    bio: validated.data.bio || null,
    specialties: validated.data.specialties ? JSON.stringify(validated.data.specialties) : null,
    certifications: validated.data.certifications ? JSON.stringify(validated.data.certifications) : null,
    hourlyRate: validated.data.hourlyRate || null,
  });

  revalidatePath("/trainers");
  return { success: true };
}

export async function updateTrainer(id: string, data: Partial<CreateTrainerInput>) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (data.firstName !== undefined) updates.firstName = data.firstName;
  if (data.lastName !== undefined) updates.lastName = data.lastName;
  if (data.email !== undefined) updates.email = data.email || null;
  if (data.phone !== undefined) updates.phone = data.phone || null;
  if (data.bio !== undefined) updates.bio = data.bio || null;
  if (data.specialties !== undefined) {
    updates.specialties = data.specialties ? JSON.stringify(data.specialties) : null;
  }
  if (data.certifications !== undefined) {
    updates.certifications = data.certifications ? JSON.stringify(data.certifications) : null;
  }
  if (data.hourlyRate !== undefined) updates.hourlyRate = data.hourlyRate || null;

  await db.update(trainer).set(updates).where(eq(trainer.id, id));

  revalidatePath("/trainers");
  return { success: true };
}

export async function toggleTrainerActive(id: string, isActive: boolean) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.update(trainer).set({ isActive, updatedAt: new Date() }).where(eq(trainer.id, id));

  revalidatePath("/trainers");
  return { success: true };
}

export async function deleteTrainer(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(trainer).where(eq(trainer.id, id));

  revalidatePath("/trainers");
  return { success: true };
}
