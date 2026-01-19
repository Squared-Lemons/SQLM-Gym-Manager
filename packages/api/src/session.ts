import { auth } from "@app/auth";
import { db, business, gym, member, organization } from "@app/database";
import { eq } from "drizzle-orm";

export type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
};

export type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
};

export type BusinessData = {
  id: string;
  organizationId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export async function getSession(
  headers: Headers
): Promise<SessionData | null> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return session as unknown as SessionData;
}

export async function requireSession(headers: Headers): Promise<SessionData> {
  const session = await getSession(headers);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getActiveOrganization(
  headers: Headers
): Promise<OrganizationData | null> {
  const org = await auth.api.getFullOrganization({ headers });
  return org as OrganizationData | null;
}

export async function requireOrganization(
  headers: Headers
): Promise<OrganizationData> {
  const org = await getActiveOrganization(headers);
  if (!org) {
    throw new Error("No active organization");
  }
  return org;
}

export async function getBusinessForOrganization(
  organizationId: string
): Promise<BusinessData | null> {
  const result = await db.query.business.findFirst({
    where: eq(business.organizationId, organizationId),
  });
  return result || null;
}

export async function requireBusiness(
  organizationId: string
): Promise<BusinessData> {
  const result = await getBusinessForOrganization(organizationId);
  if (!result) {
    throw new Error("No business found for organization");
  }
  return result;
}

export async function getGymsForBusiness(businessId: string) {
  return db.query.gym.findMany({
    where: eq(gym.businessId, businessId),
    orderBy: (gym, { asc }) => [asc(gym.name)],
  });
}

export async function checkOnboardingStatus(headers: Headers) {
  const session = await getSession(headers);
  if (!session) {
    return { hasUser: false, hasOrganization: false, hasBusiness: false, hasGym: false };
  }

  const org = await getActiveOrganization(headers);
  if (!org) {
    return { hasUser: true, hasOrganization: false, hasBusiness: false, hasGym: false };
  }

  const businessData = await getBusinessForOrganization(org.id);
  if (!businessData) {
    return { hasUser: true, hasOrganization: true, hasBusiness: false, hasGym: false };
  }

  const gyms = await getGymsForBusiness(businessData.id);
  return {
    hasUser: true,
    hasOrganization: true,
    hasBusiness: true,
    hasGym: gyms.length > 0,
  };
}
