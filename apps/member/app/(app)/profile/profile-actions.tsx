"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@app/auth/client";
import { Button } from "@app/ui";
import { LogOut } from "lucide-react";

export function ProfileActions() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="pt-4">
      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
