"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@app/ui";
import { Plus } from "lucide-react";
import { createSubscriptionPlan, deleteSubscriptionPlan, createPTPackage, deletePTPackage } from "@/lib/actions/plans";
import { formatCurrency } from "@app/api/client";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  billingPeriod: string;
  features: string | null;
  isActive: boolean;
};

type PTPackage = {
  id: string;
  gymId: string;
  name: string;
  description: string | null;
  sessionCount: number;
  priceInCents: number;
  validityDays: number;
  isActive: boolean;
};

type Gym = { id: string; name: string };

export function PlansList({
  initialSubscriptionPlans,
  initialPTPackages,
  gyms,
}: {
  initialSubscriptionPlans: SubscriptionPlan[];
  initialPTPackages: PTPackage[];
  gyms: Gym[];
}) {
  const [subscriptionPlans, setSubscriptionPlans] = useState(initialSubscriptionPlans);
  const [ptPackages, setPtPackages] = useState(initialPTPackages);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Subscription plan form
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  // PT package form
  const [selectedGymId, setSelectedGymId] = useState(gyms[0]?.id || "");
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [sessionCount, setSessionCount] = useState("5");
  const [packagePrice, setPackagePrice] = useState("");
  const [validityDays, setValidityDays] = useState("90");

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createSubscriptionPlan({
        name: planName,
        description: planDescription || undefined,
        priceInCents: Math.round(parseFloat(planPrice) * 100),
        billingPeriod: billingPeriod as "monthly" | "quarterly" | "yearly",
      });

      if ("error" in result) {
        toast.error("Failed to create plan");
        return;
      }

      toast.success("Plan created");
      setIsAddPlanOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePackage(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createPTPackage(selectedGymId, {
        name: packageName,
        description: packageDescription || undefined,
        sessionCount: parseInt(sessionCount),
        priceInCents: Math.round(parseFloat(packagePrice) * 100),
        validityDays: parseInt(validityDays),
      });

      if ("error" in result) {
        toast.error("Failed to create package");
        return;
      }

      toast.success("Package created");
      setIsAddPackageOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeletePlan(plan: SubscriptionPlan) {
    if (!confirm(`Delete "${plan.name}"?`)) return;
    try {
      await deleteSubscriptionPlan(plan.id);
      setSubscriptionPlans(subscriptionPlans.filter((p) => p.id !== plan.id));
      toast.success("Plan deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleDeletePackage(pkg: PTPackage) {
    if (!confirm(`Delete "${pkg.name}"?`)) return;
    try {
      await deletePTPackage(pkg.id);
      setPtPackages(ptPackages.filter((p) => p.id !== pkg.id));
      toast.success("Package deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <Tabs defaultValue="subscriptions" className="space-y-4">
      <TabsList>
        <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
        <TabsTrigger value="pt">PT Packages</TabsTrigger>
      </TabsList>

      <TabsContent value="subscriptions" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreatePlan}>
                <DialogHeader>
                  <DialogTitle>Add Subscription Plan</DialogTitle>
                  <DialogDescription>Create a new membership plan</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Basic Monthly" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} placeholder="Access to gym equipment" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input type="number" step="0.01" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} placeholder="29.99" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Period</Label>
                      <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {subscriptionPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No subscription plans yet. Create your first plan.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatCurrency(plan.priceInCents)}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.billingPeriod}</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 text-destructive" onClick={() => handleDeletePlan(plan)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="pt" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isAddPackageOpen} onOpenChange={setIsAddPackageOpen}>
            <DialogTrigger asChild>
              <Button disabled={gyms.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreatePackage}>
                <DialogHeader>
                  <DialogTitle>Add PT Package</DialogTitle>
                  <DialogDescription>Create a personal training package</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Gym</Label>
                    <Select value={selectedGymId} onValueChange={setSelectedGymId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gyms.map((gym) => (
                          <SelectItem key={gym.id} value={gym.id}>{gym.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="Starter Pack" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} placeholder="5 sessions" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Sessions</Label>
                      <Input type="number" value={sessionCount} onChange={(e) => setSessionCount(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input type="number" step="0.01" value={packagePrice} onChange={(e) => setPackagePrice(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid (days)</Label>
                      <Input type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {ptPackages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No PT packages yet. Create your first package.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ptPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(pkg.priceInCents)}</div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.sessionCount} sessions • Valid {pkg.validityDays} days
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 text-destructive" onClick={() => handleDeletePackage(pkg)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
