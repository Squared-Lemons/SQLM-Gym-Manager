import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui";
import { requireSession, requireOrganization, requireBusiness, getGymsForBusiness } from "@app/api";
import { db, gymMember, trainer, classType } from "@app/database";
import { eq, inArray } from "drizzle-orm";
import { Building2, Users, Dumbbell, Calendar } from "lucide-react";

async function getDashboardStats() {
  const hdrs = await headers();
  await requireSession(hdrs);
  const org = await requireOrganization(hdrs);
  const biz = await requireBusiness(org.id);
  const gyms = await getGymsForBusiness(biz.id);

  const gymIds = gyms.map((g) => g.id);

  // Get counts
  const [members, trainers, classes] = await Promise.all([
    gymIds.length > 0
      ? db.query.gymMember.findMany({
          columns: { id: true, status: true, gymId: true },
        }).then((all) => all.filter((m) => gymIds.includes(m.gymId)))
      : [],
    gymIds.length > 0
      ? db.query.trainer.findMany({
          columns: { id: true, isActive: true, gymId: true },
        }).then((all) => all.filter((t) => gymIds.includes(t.gymId)))
      : [],
    gymIds.length > 0
      ? db.query.classType.findMany({
          columns: { id: true, isActive: true, gymId: true },
        }).then((all) => all.filter((c) => gymIds.includes(c.gymId)))
      : [],
  ]);

  return {
    gymsCount: gyms.length,
    activeGyms: gyms.filter((g) => g.isActive).length,
    membersCount: members.length,
    activeMembers: members.filter((m) => m.status === "active").length,
    trainersCount: trainers.length,
    activeTrainers: trainers.filter((t) => t.isActive).length,
    classesCount: classes.length,
    activeClasses: classes.filter((c) => c.isActive).length,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Gyms",
      value: stats.gymsCount,
      description: `${stats.activeGyms} active`,
      icon: Building2,
    },
    {
      title: "Members",
      value: stats.membersCount,
      description: `${stats.activeMembers} active`,
      icon: Users,
    },
    {
      title: "Trainers",
      value: stats.trainersCount,
      description: `${stats.activeTrainers} active`,
      icon: Dumbbell,
    },
    {
      title: "Class Types",
      value: stats.classesCount,
      description: `${stats.activeClasses} active`,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your gym management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can do right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/members"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="font-medium">Add a member</div>
              <div className="text-sm text-muted-foreground">
                Register a new member at your gym
              </div>
            </a>
            <a
              href="/classes"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="font-medium">Schedule a class</div>
              <div className="text-sm text-muted-foreground">
                Add a new class to your schedule
              </div>
            </a>
            <a
              href="/trainers"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="font-medium">Add a trainer</div>
              <div className="text-sm text-muted-foreground">
                Register a new personal trainer
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Next steps for your gym</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div
                className={`h-3 w-3 rounded-full ${
                  stats.gymsCount > 0 ? "bg-green-500" : "bg-muted"
                }`}
              />
              <div>
                <div className="font-medium">Set up your gym</div>
                <div className="text-sm text-muted-foreground">
                  Add gym details and facilities
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div
                className={`h-3 w-3 rounded-full ${
                  stats.membersCount > 0 ? "bg-green-500" : "bg-muted"
                }`}
              />
              <div>
                <div className="font-medium">Add your first member</div>
                <div className="text-sm text-muted-foreground">
                  Register members to start tracking
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div
                className={`h-3 w-3 rounded-full ${
                  stats.classesCount > 0 ? "bg-green-500" : "bg-muted"
                }`}
              />
              <div>
                <div className="font-medium">Create class types</div>
                <div className="text-sm text-muted-foreground">
                  Define the classes you offer
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
