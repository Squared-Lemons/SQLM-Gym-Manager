import { getSubscriptionPlans, getPTPackages } from "@/lib/actions/plans";
import { getGyms } from "@/lib/actions/gyms";
import { PlansList } from "./plans-list";

export default async function PlansPage() {
  const [subscriptionPlans, ptPackages, gyms] = await Promise.all([
    getSubscriptionPlans(),
    getPTPackages(),
    getGyms(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Plans & Packages</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and PT packages
        </p>
      </div>

      <PlansList
        initialSubscriptionPlans={subscriptionPlans}
        initialPTPackages={ptPackages}
        gyms={gyms}
      />
    </div>
  );
}
