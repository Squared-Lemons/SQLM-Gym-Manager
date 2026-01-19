import { getTrainers } from "@/lib/actions/trainers";
import { getGyms } from "@/lib/actions/gyms";
import { TrainersList } from "./trainers-list";

export default async function TrainersPage() {
  const [trainers, gyms] = await Promise.all([getTrainers(), getGyms()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trainers</h1>
        <p className="text-muted-foreground">
          Manage personal trainers
        </p>
      </div>

      <TrainersList initialTrainers={trainers} gyms={gyms} />
    </div>
  );
}
