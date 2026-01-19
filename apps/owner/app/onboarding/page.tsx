"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { completeOnboarding, getOnboardingStatus } from "@/lib/actions/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Business info
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // Gym info
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");

  useEffect(() => {
    async function checkStatus() {
      const status = await getOnboardingStatus();
      if (!status.hasUser) {
        router.push("/signup");
      } else if (status.hasGym) {
        router.push("/dashboard");
      }
      setIsChecking(false);
    }
    checkStatus();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (step === 1) {
      if (!businessName.trim()) {
        toast.error("Business name is required");
        return;
      }
      setStep(2);
      return;
    }

    if (!gymName.trim()) {
      toast.error("Gym name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await completeOnboarding({
        businessName,
        businessEmail,
        businessPhone,
        gymName,
        gymAddress,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Welcome! Your gym is ready.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {step === 1 ? "Set up your business" : "Add your first gym"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Tell us about your fitness business"
                  : "Add details about your gym location"}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {step} of 2
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="Fitness Co"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="contact@business.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Phone Number</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    placeholder="+1 555 0100"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gymName">Gym Name *</Label>
                  <Input
                    id="gymName"
                    placeholder="Downtown Gym"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gymAddress">Address</Label>
                  <Input
                    id="gymAddress"
                    placeholder="123 Main St, City"
                    value={gymAddress}
                    onChange={(e) => setGymAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading
                  ? "Creating..."
                  : step === 1
                  ? "Continue"
                  : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
