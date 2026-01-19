"use server";

import { headers } from "next/headers";
import { db, subscriptionPlan, ptPackage } from "@app/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireSession, requireOrganization, requireBusiness, getGymsForBusiness } from "@app/api";
import { createSubscriptionPlanSchema, createPTPackageSchema, type CreateSubscriptionPlanInput, type CreatePTPackageInput } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getSubscriptionPlans() {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);

  return db.query.subscriptionPlan.findMany({
    where: eq(subscriptionPlan.businessId, biz.id),
    orderBy: (subscriptionPlan, { asc }) => [asc(subscriptionPlan.name)],
  });
}

export async function createSubscriptionPlan(data: CreateSubscriptionPlanInput) {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);

  const validated = createSubscriptionPlanSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.insert(subscriptionPlan).values({
    id: nanoid(),
    businessId: biz.id,
    gymId: validated.data.gymId || null,
    name: validated.data.name,
    description: validated.data.description || null,
    priceInCents: validated.data.priceInCents,
    billingPeriod: validated.data.billingPeriod,
    features: validated.data.features ? JSON.stringify(validated.data.features) : null,
  });

  revalidatePath("/plans");
  return { success: true };
}

export async function deleteSubscriptionPlan(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(subscriptionPlan).where(eq(subscriptionPlan.id, id));
  revalidatePath("/plans");
  return { success: true };
}

export async function getPTPackages() {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);
  const gyms = await getGymsForBusiness(biz.id);

  if (gyms.length === 0) return [];

  const gymIds = gyms.map((g) => g.id);
  const packages = await db.query.ptPackage.findMany({
    orderBy: (ptPackage, { asc }) => [asc(ptPackage.name)],
  });

  return packages.filter((p) => gymIds.includes(p.gymId));
}

export async function createPTPackage(gymId: string, data: CreatePTPackageInput) {
  const hdrs = await headers();
  await requireSession(hdrs);

  const validated = createPTPackageSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.insert(ptPackage).values({
    id: nanoid(),
    gymId,
    name: validated.data.name,
    description: validated.data.description || null,
    sessionCount: validated.data.sessionCount,
    priceInCents: validated.data.priceInCents,
    validityDays: validated.data.validityDays,
  });

  revalidatePath("/plans");
  return { success: true };
}

export async function deletePTPackage(id: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.delete(ptPackage).where(eq(ptPackage.id, id));
  revalidatePath("/plans");
  return { success: true };
}
