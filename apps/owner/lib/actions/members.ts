"use server";

import { headers } from "next/headers";
import { db, gymMember, checkIn } from "@app/database";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireSession, requireOrganization, requireBusiness, getGymsForBusiness, generateQRCode, generateMemberNumber } from "@app/api";
import { createMemberSchema, type CreateMemberInput, type UpdateMemberInput } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getMembersForGym(gymId: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.gymMember.findMany({
    where: eq(gymMember.gymId, gymId),
    orderBy: (gymMember, { asc }) => [asc(gymMember.lastName), asc(gymMember.firstName)],
  });
}

export async function getAllMembers() {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);
  const gyms = await getGymsForBusiness(biz.id);

  if (gyms.length === 0) return [];

  const gymIds = gyms.map((g) => g.id);

  // Get members for all gyms
  const members = await db.query.gymMember.findMany({
    orderBy: (gymMember, { asc }) => [asc(gymMember.lastName), asc(gymMember.firstName)],
  });

  return members.filter((m) => gymIds.includes(m.gymId));
}

export async function getMember(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.gymMember.findFirst({
    where: eq(gymMember.id, id),
  });
}

export async function createMember(gymId: string, data: CreateMemberInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const validated = createMemberSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const memberId = nanoid();
  const memberNumber = generateMemberNumber();
  const qrCode = generateQRCode(gymId, memberId);

  await db.insert(gymMember).values({
    id: memberId,
    gymId,
    firstName: validated.data.firstName,
    lastName: validated.data.lastName,
    email: validated.data.email || null,
    phone: validated.data.phone || null,
    dateOfBirth: validated.data.dateOfBirth ? new Date(validated.data.dateOfBirth) : null,
    emergencyContact: validated.data.emergencyContact || null,
    emergencyPhone: validated.data.emergencyPhone || null,
    notes: validated.data.notes || null,
    memberNumber,
    qrCode,
    status: "active",
  });

  revalidatePath("/members");
  return { success: true, memberId };
}

export async function updateMember(id: string, data: UpdateMemberInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.firstName !== undefined) updates.firstName = data.firstName;
  if (data.lastName !== undefined) updates.lastName = data.lastName;
  if (data.email !== undefined) updates.email = data.email || null;
  if (data.phone !== undefined) updates.phone = data.phone || null;
  if (data.dateOfBirth !== undefined) {
    updates.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  }
  if (data.emergencyContact !== undefined) updates.emergencyContact = data.emergencyContact || null;
  if (data.emergencyPhone !== undefined) updates.emergencyPhone = data.emergencyPhone || null;
  if (data.notes !== undefined) updates.notes = data.notes || null;

  await db.update(gymMember).set(updates).where(eq(gymMember.id, id));

  revalidatePath("/members");
  return { success: true };
}

export async function updateMemberStatus(id: string, status: "active" | "inactive" | "suspended" | "cancelled") {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.update(gymMember).set({ status, updatedAt: new Date() }).where(eq(gymMember.id, id));

  revalidatePath("/members");
  return { success: true };
}

export async function deleteMember(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(gymMember).where(eq(gymMember.id, id));

  revalidatePath("/members");
  return { success: true };
}

export async function recordCheckIn(memberId: string, gymId: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.insert(checkIn).values({
    id: nanoid(),
    gymMemberId: memberId,
    gymId,
  });

  revalidatePath("/members");
  return { success: true };
}

export async function getMemberCheckIns(memberId: string, limit: number = 10) {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.checkIn.findMany({
    where: eq(checkIn.gymMemberId, memberId),
    orderBy: (checkIn, { desc }) => [desc(checkIn.checkedInAt)],
    limit,
  });
}
