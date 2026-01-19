import { getMemberClasses, getMemberBookings } from "@/lib/actions/member";
import { ClassesList } from "./classes-list";

export default async function ClassesPage() {
  const [classes, bookings] = await Promise.all([
    getMemberClasses(),
    getMemberBookings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Classes</h1>
        <p className="text-muted-foreground">Browse and book gym classes</p>
      </div>

      <ClassesList classes={classes} bookings={bookings} />
    </div>
  );
}
