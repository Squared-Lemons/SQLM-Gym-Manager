"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@app/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  toast,
} from "@app/ui";
import { linkMemberAccount, getMemberProfile } from "@/lib/actions/member";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [memberNumber, setMemberNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (isPending) return;

      if (!session?.user) {
        router.push("/signup");
        return;
      }

      const profile = await getMemberProfile();
      if (profile) {
        router.push("/dashboard");
        return;
      }

      setEmail(session.user.email);
      setIsChecking(false);
    }
    check();
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await linkMemberAccount(memberNumber, email);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Membership linked successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (isPending || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Link Your Membership</CardTitle>
          <CardDescription>
            Enter your member number to link your account to your gym membership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberNumber">Member Number *</Label>
              <Input
                id="memberNumber"
                placeholder="MEM-ABC123-WXYZ"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can find this on your membership card or ask staff
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email on File *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The email address registered with your membership
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Linking..." : "Link Membership"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
