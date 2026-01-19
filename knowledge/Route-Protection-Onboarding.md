# Route Protection & Onboarding

Patterns for protecting routes and guiding users through onboarding flows.

---

## Onboarding Check Component

```typescript
// apps/web/components/onboarding-check.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useActiveOrganization } from "@app/auth/client";
import { Loader2 } from "lucide-react";
import { checkOnboardingStatus } from "@/lib/actions/onboarding";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: activeOrg, isPending: orgPending } = useActiveOrganization();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (sessionPending || orgPending) return;

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const status = await checkOnboardingStatus();

      if (!status.hasOrganization || !status.hasSetup) {
        router.push("/onboarding");
        return;
      }

      setChecking(false);
    }

    check();
  }, [session, activeOrg, sessionPending, orgPending, router]);

  if (sessionPending || orgPending || checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Dashboard Layout with Protection

```typescript
// apps/web/app/(dashboard)/layout.tsx
import { OnboardingCheck } from "@/components/onboarding-check";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingCheck>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </OnboardingCheck>
  );
}
```

---

## Onboarding Status Server Action

```typescript
// apps/web/lib/actions/onboarding.ts
"use server";

import { auth } from "@app/auth";
import { db } from "@app/database";
import { items } from "@app/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function checkOnboardingStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      hasUser: false,
      hasOrganization: false,
      hasSetup: false,
    };
  }

  const activeOrg = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  const hasOrganization = !!activeOrg;

  // Check for app-specific setup requirement
  let hasSetup = false;
  if (activeOrg) {
    const firstItem = await db.query.items.findFirst({
      where: eq(items.organizationId, activeOrg.id),
    });
    hasSetup = !!firstItem;
  }

  return {
    hasUser: true,
    hasOrganization,
    hasSetup,
  };
}
```

---

## Multi-Step Onboarding Flow

```typescript
// apps/web/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useActiveOrganization, organization } from "@app/auth/client";
import { createFirstItem } from "@/lib/actions/onboarding";

type Step = "organization" | "setup" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: activeOrg } = useActiveOrganization();
  const [step, setStep] = useState<Step>(
    activeOrg ? "setup" : "organization"
  );

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {step === "organization" && (
          <OrganizationStep onComplete={() => setStep("setup")} />
        )}
        {step === "setup" && (
          <SetupStep onComplete={() => setStep("complete")} />
        )}
        {step === "complete" && (
          <CompleteStep onContinue={() => router.push("/dashboard")} />
        )}
      </div>
    </div>
  );
}

function OrganizationStep({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await organization.create({
      name,
      slug,
    });

    onComplete();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Create your organization</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Organization name"
        required
        className="w-full rounded border p-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-primary p-2 text-white"
      >
        {loading ? "Creating..." : "Continue"}
      </button>
    </form>
  );
}

function SetupStep({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await createFirstItem({ name });
    onComplete();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Set up your first item</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        required
        className="w-full rounded border p-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-primary p-2 text-white"
      >
        {loading ? "Creating..." : "Continue"}
      </button>
    </form>
  );
}

function CompleteStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold">You're all set!</h2>
      <p className="text-muted-foreground">
        Your account is ready to use.
      </p>
      <button
        onClick={onContinue}
        className="w-full rounded bg-primary p-2 text-white"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
```

---

## Auth Route (Public)

```typescript
// apps/web/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No protection - public routes
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      {children}
    </div>
  );
}
```

---

## Route Groups Structure

```
app/
├── (auth)/                    # Public routes - no protection
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── (dashboard)/               # Protected routes - OnboardingCheck
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   └── layout.tsx
├── onboarding/                # Semi-protected - needs auth, not org
│   └── page.tsx
└── api/
    └── auth/[...all]/route.ts
```

---

## Middleware Alternative

For server-side protection (optional, more complex):

```typescript
// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/signup", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Tips

1. **Client-side checks are simpler** - Use OnboardingCheck component for most cases
2. **Server-side for API routes** - Always verify session in server actions
3. **Progressive onboarding** - Check multiple conditions (org, setup, etc.)
4. **Loading states matter** - Show spinners during auth checks
5. **Redirect loops** - Be careful with redirect logic to avoid infinite loops

---

*See also: [Better Auth Guide](../auth/better-auth/Better-Auth-Guide.md), [Server Actions Patterns](Server-Actions-Patterns.md)*
