import { getClassTypes, getClassSchedules } from "@/lib/actions/classes";
import { getGyms } from "@/lib/actions/gyms";
import { getTrainers } from "@/lib/actions/trainers";
import { ClassesList } from "./classes-list";

export default async function ClassesPage() {
  const [classTypes, schedules, gyms, trainers] = await Promise.all([
    getClassTypes(),
    getClassSchedules(),
    getGyms(),
    getTrainers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Classes</h1>
        <p className="text-muted-foreground">
          Manage class types and schedules
        </p>
      </div>

      <ClassesList
        initialClassTypes={classTypes}
        initialSchedules={schedules}
        gyms={gyms}
        trainers={trainers}
      />
    </div>
  );
}
