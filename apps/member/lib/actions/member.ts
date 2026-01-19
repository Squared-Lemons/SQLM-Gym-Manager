"use server";

import { headers } from "next/headers";
import { auth } from "@app/auth";
import { db, gymMember, gym, classSchedule, classType, classBooking, trainer } from "@app/database";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getMemberProfile() {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return null;
  }

  const member = await db.query.gymMember.findFirst({
    where: eq(gymMember.userId, session.user.id),
  });

  if (!member) {
    return null;
  }

  const memberGym = await db.query.gym.findFirst({
    where: eq(gym.id, member.gymId),
  });

  return {
    ...member,
    gym: memberGym,
  };
}

export async function linkMemberAccount(memberNumber: string, email: string) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // Find member by member number and email
  const member = await db.query.gymMember.findFirst({
    where: and(
      eq(gymMember.memberNumber, memberNumber),
      eq(gymMember.email, email)
    ),
  });

  if (!member) {
    return { error: "Member not found. Please check your member number and email." };
  }

  if (member.userId) {
    return { error: "This membership is already linked to an account." };
  }

  // Link the user to the member record
  await db
    .update(gymMember)
    .set({ userId: session.user.id, updatedAt: new Date() })
    .where(eq(gymMember.id, member.id));

  revalidatePath("/");
  return { success: true };
}

export async function getMemberClasses() {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return [];
  }

  const member = await db.query.gymMember.findFirst({
    where: eq(gymMember.userId, session.user.id),
  });

  if (!member) {
    return [];
  }

  // Get class schedules for this gym
  const schedules = await db.query.classSchedule.findMany({
    where: eq(classSchedule.gymId, member.gymId),
    with: {
      classType: true,
      instructor: true,
    },
    orderBy: (classSchedule, { asc }) => [asc(classSchedule.dayOfWeek), asc(classSchedule.startTime)],
  });

  return schedules;
}

export async function bookClass(scheduleId: string, classDate: Date) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const member = await db.query.gymMember.findFirst({
    where: eq(gymMember.userId, session.user.id),
  });

  if (!member) {
    return { error: "Member profile not found" };
  }

  // Check if already booked
  const existing = await db.query.classBooking.findFirst({
    where: and(
      eq(classBooking.classScheduleId, scheduleId),
      eq(classBooking.gymMemberId, member.id),
      eq(classBooking.classDate, classDate)
    ),
  });

  if (existing) {
    return { error: "Already booked for this class" };
  }

  await db.insert(classBooking).values({
    id: nanoid(),
    classScheduleId: scheduleId,
    gymMemberId: member.id,
    classDate,
    status: "booked",
  });

  revalidatePath("/classes");
  return { success: true };
}

export async function cancelBooking(bookingId: string) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await db
    .update(classBooking)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(classBooking.id, bookingId));

  revalidatePath("/classes");
  return { success: true };
}

export async function getMemberBookings() {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return [];
  }

  const member = await db.query.gymMember.findFirst({
    where: eq(gymMember.userId, session.user.id),
  });

  if (!member) {
    return [];
  }

  const bookings = await db.query.classBooking.findMany({
    where: eq(classBooking.gymMemberId, member.id),
    with: {
      classSchedule: {
        with: {
          classType: true,
          instructor: true,
        },
      },
    },
    orderBy: (classBooking, { desc }) => [desc(classBooking.classDate)],
  });

  return bookings;
}

export async function getGymTrainers() {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return [];
  }

  const member = await db.query.gymMember.findFirst({
    where: eq(gymMember.userId, session.user.id),
  });

  if (!member) {
    return [];
  }

  return db.query.trainer.findMany({
    where: and(eq(trainer.gymId, member.gymId), eq(trainer.isActive, true)),
    orderBy: (trainer, { asc }) => [asc(trainer.lastName), asc(trainer.firstName)],
  });
}
