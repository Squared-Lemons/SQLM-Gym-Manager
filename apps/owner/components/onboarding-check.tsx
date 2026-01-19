"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@app/auth/client";
import { getOnboardingStatus } from "@/lib/actions/onboarding";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (isPending) return;

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const status = await getOnboardingStatus();

      if (!status.hasOrganization || !status.hasBusiness || !status.hasGym) {
        router.push("/onboarding");
        return;
      }

      setIsChecking(false);
    }

    check();
  }, [session, isPending, router, pathname]);

  if (isPending || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
