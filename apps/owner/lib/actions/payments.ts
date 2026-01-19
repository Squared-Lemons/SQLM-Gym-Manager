"use server";

import { headers } from "next/headers";
import { db, payment } from "@app/database";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireSession, requireOrganization, requireBusiness, getGymsForBusiness } from "@app/api";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.payment.findMany({
    with: {
      gymMember: true,
      subscriptionPlan: true,
    },
    orderBy: (payment, { desc }) => [desc(payment.createdAt)],
    limit: 100,
  });
}

export async function recordPayment(data: {
  gymMemberId: string;
  subscriptionPlanId?: string;
  amountInCents: number;
  paymentMethod: "card" | "cash" | "bank_transfer" | "other";
  description?: string;
}) {
  const hdrs = await headers();
  await requireSession(hdrs);

  await db.insert(payment).values({
    id: nanoid(),
    gymMemberId: data.gymMemberId,
    subscriptionPlanId: data.subscriptionPlanId || null,
    amountInCents: data.amountInCents,
    paymentMethod: data.paymentMethod,
    status: "succeeded",
    paidAt: new Date(),
    description: data.description || null,
  });

  revalidatePath("/payments");
  return { success: true };
}

export async function getPaymentsForMember(memberId: string) {
  const hdrs = await headers();
  await requireSession(hdrs);

  return db.query.payment.findMany({
    where: eq(payment.gymMemberId, memberId),
    with: {
      subscriptionPlan: true,
    },
    orderBy: (payment, { desc }) => [desc(payment.createdAt)],
  });
}
