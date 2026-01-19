"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, toast } from "@app/ui";
import { getDayName, formatTime } from "@app/api/client";
import { bookClass } from "@/lib/actions/member";
import { Clock, Users, MapPin } from "lucide-react";

type ClassSchedule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  classType: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    maxCapacity: number;
    color: string | null;
  };
  instructor: {
    firstName: string;
    lastName: string;
  } | null;
};

type Booking = {
  id: string;
  classScheduleId: string;
  classDate: Date;
  status: string;
};

export function ClassesList({
  classes,
  bookings,
}: {
  classes: ClassSchedule[];
  bookings: Booking[];
}) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Group by day
  const classesByDay = classes.reduce((acc, cls) => {
    const day = cls.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(cls);
    return acc;
  }, {} as Record<number, ClassSchedule[]>);

  const today = new Date().getDay();
  const sortedDays = [0, 1, 2, 3, 4, 5, 6].sort((a, b) => {
    const aOffset = (a - today + 7) % 7;
    const bOffset = (b - today + 7) % 7;
    return aOffset - bOffset;
  });

  async function handleBook(schedule: ClassSchedule) {
    setIsLoading(schedule.id);

    try {
      // Calculate next occurrence of this day
      const now = new Date();
      const dayDiff = (schedule.dayOfWeek - now.getDay() + 7) % 7;
      const classDate = new Date(now);
      classDate.setDate(now.getDate() + (dayDiff === 0 ? 7 : dayDiff));
      classDate.setHours(0, 0, 0, 0);

      const result = await bookClass(schedule.id, classDate);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Class booked!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to book class");
    } finally {
      setIsLoading(null);
    }
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No classes available at your gym yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDays.map((day) => {
        const dayClasses = classesByDay[day];
        if (!dayClasses || dayClasses.length === 0) return null;

        return (
          <div key={day}>
            <h2 className="mb-3 text-lg font-semibold">
              {getDayName(day)}
              {day === today && (
                <Badge variant="secondary" className="ml-2">
                  Today
                </Badge>
              )}
            </h2>
            <div className="space-y-3">
              {dayClasses.map((cls) => (
                <Card key={cls.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-1 rounded-full"
                        style={{ backgroundColor: cls.classType.color || "#3b82f6" }}
                      />
                      <div>
                        <div className="font-medium">{cls.classType.name}</div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                          </span>
                          {cls.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cls.room}
                            </span>
                          )}
                        </div>
                        {cls.instructor && (
                          <div className="text-sm text-muted-foreground">
                            {cls.instructor.firstName} {cls.instructor.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBook(cls)}
                      disabled={isLoading === cls.id}
                    >
                      {isLoading === cls.id ? "Booking..." : "Book"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
