"use server";

import { headers } from "next/headers";
import { auth } from "@app/auth";
import { db, gym, business } from "@app/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateSlug, requireSession, requireOrganization, requireBusiness } from "@app/api";
import { createGymSchema, type CreateGymInput, type UpdateGymInput } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getGyms() {
  const hdrs = await headers();
  const session = await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);

  return db.query.gym.findMany({
    where: eq(gym.businessId, biz.id),
    orderBy: (gym, { asc }) => [asc(gym.name)],
  });
}

export async function getGym(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.gym.findFirst({
    where: eq(gym.id, id),
  });
}

export async function createGym(data: CreateGymInput) {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);

  const validated = createGymSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const slug = generateSlug(validated.data.name);

  await db.insert(gym).values({
    id: nanoid(),
    businessId: biz.id,
    name: validated.data.name,
    slug,
    address: validated.data.address || null,
    phone: validated.data.phone || null,
    email: validated.data.email || null,
    facilities: validated.data.facilities ? JSON.stringify(validated.data.facilities) : null,
  });

  revalidatePath("/gyms");
  return { success: true };
}

export async function updateGym(id: string, data: UpdateGymInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    updates.name = data.name;
    updates.slug = generateSlug(data.name);
  }
  if (data.address !== undefined) updates.address = data.address || null;
  if (data.phone !== undefined) updates.phone = data.phone || null;
  if (data.email !== undefined) updates.email = data.email || null;
  if (data.facilities !== undefined) {
    updates.facilities = data.facilities ? JSON.stringify(data.facilities) : null;
  }

  await db.update(gym).set(updates).where(eq(gym.id, id));

  revalidatePath("/gyms");
  return { success: true };
}

export async function toggleGymActive(id: string, isActive: boolean) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.update(gym).set({ isActive, updatedAt: new Date() }).where(eq(gym.id, id));

  revalidatePath("/gyms");
  return { success: true };
}

export async function deleteGym(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(gym).where(eq(gym.id, id));

  revalidatePath("/gyms");
  return { success: true };
}
