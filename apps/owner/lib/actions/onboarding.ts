"use server";

import { headers } from "next/headers";
import { auth } from "@app/auth";
import { db, business, gym } from "@app/database";
import { nanoid } from "nanoid";
import { generateSlug, checkOnboardingStatus } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getOnboardingStatus() {
  const hdrs = await headers();
  return checkOnboardingStatus(hdrs);
}

export async function completeOnboarding(data: {
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  gymName: string;
  gymAddress?: string;
}) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Create organization first
    const orgSlug = generateSlug(data.businessName);
    const org = await auth.api.createOrganization({
      body: {
        name: data.businessName,
        slug: orgSlug,
      },
      headers: hdrs,
    });

    if (!org) {
      return { error: "Failed to create organization" };
    }

    // Set the organization as active
    await auth.api.setActiveOrganization({
      body: { organizationId: org.id },
      headers: hdrs,
    });

    // Create business
    const businessId = nanoid();
    await db.insert(business).values({
      id: businessId,
      organizationId: org.id,
      name: data.businessName,
      email: data.businessEmail || null,
      phone: data.businessPhone || null,
    });

    // Create first gym
    const gymId = nanoid();
    const gymSlug = generateSlug(data.gymName);
    await db.insert(gym).values({
      id: gymId,
      businessId,
      name: data.gymName,
      slug: gymSlug,
      address: data.gymAddress || null,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Failed to complete onboarding" };
  }
}
