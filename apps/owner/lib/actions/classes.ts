"use server";

import { headers } from "next/headers";
import { db, classType, classSchedule, classBooking } from "@app/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireSession, requireOrganization, requireBusiness, getGymsForBusiness } from "@app/api";
import { createClassTypeSchema, createClassScheduleSchema, type CreateClassTypeInput, type CreateClassScheduleInput } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getClassTypes() {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);
  const gyms = await getGymsForBusiness(biz.id);

  if (gyms.length === 0) return [];

  const gymIds = gyms.map((g) => g.id);
  const types = await db.query.classType.findMany({
    orderBy: (classType, { asc }) => [asc(classType.name)],
  });

  return types.filter((t) => gymIds.includes(t.gymId));
}

export async function getClassSchedules(gymId?: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  if (gymId) {
    return db.query.classSchedule.findMany({
      where: eq(classSchedule.gymId, gymId),
      with: {
        classType: true,
        instructor: true,
      },
      orderBy: (classSchedule, { asc }) => [asc(classSchedule.dayOfWeek), asc(classSchedule.startTime)],
    });
  }

  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);
  const gyms = await getGymsForBusiness(biz.id);

  if (gyms.length === 0) return [];

  const gymIds = gyms.map((g) => g.id);
  const schedules = await db.query.classSchedule.findMany({
    with: {
      classType: true,
      instructor: true,
    },
    orderBy: (classSchedule, { asc }) => [asc(classSchedule.dayOfWeek), asc(classSchedule.startTime)],
  });

  return schedules.filter((s) => gymIds.includes(s.gymId));
}

export async function createClassType(gymId: string, data: CreateClassTypeInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const validated = createClassTypeSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.insert(classType).values({
    id: nanoid(),
    gymId,
    name: validated.data.name,
    description: validated.data.description || null,
    durationMinutes: validated.data.durationMinutes,
    maxCapacity: validated.data.maxCapacity,
    color: validated.data.color || "#3b82f6",
  });

  revalidatePath("/classes");
  return { success: true };
}

export async function createClassScheduleAction(gymId: string, data: CreateClassScheduleInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const validated = createClassScheduleSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.insert(classSchedule).values({
    id: nanoid(),
    gymId,
    classTypeId: validated.data.classTypeId,
    instructorId: validated.data.instructorId || null,
    dayOfWeek: validated.data.dayOfWeek,
    startTime: validated.data.startTime,
    endTime: validated.data.endTime,
    room: validated.data.room || null,
  });

  revalidatePath("/classes");
  return { success: true };
}

export async function deleteClassType(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(classType).where(eq(classType.id, id));
  revalidatePath("/classes");
  return { success: true };
}

export async function deleteClassScheduleAction(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(classSchedule).where(eq(classSchedule.id, id));
  revalidatePath("/classes");
  return { success: true };
}
