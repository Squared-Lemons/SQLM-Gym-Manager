"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
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
import { Plus, Clock, Users } from "lucide-react";
import { createClassType, createClassScheduleAction, deleteClassType } from "@/lib/actions/classes";
import { getDayName, formatTime } from "@app/api/client";

type ClassType = {
  id: string;
  gymId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  maxCapacity: number;
  color: string | null;
  isActive: boolean;
};

type ClassSchedule = {
  id: string;
  gymId: string;
  classTypeId: string;
  instructorId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  classType: ClassType;
  instructor: { firstName: string; lastName: string } | null;
};

type Gym = { id: string; name: string };
type Trainer = { id: string; firstName: string; lastName: string };

export function ClassesList({
  initialClassTypes,
  initialSchedules,
  gyms,
  trainers,
}: {
  initialClassTypes: ClassType[];
  initialSchedules: ClassSchedule[];
  gyms: Gym[];
  trainers: Trainer[];
}) {
  const [classTypes, setClassTypes] = useState(initialClassTypes);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Class Type form
  const [selectedGymId, setSelectedGymId] = useState(gyms[0]?.id || "");
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [capacity, setCapacity] = useState("20");

  // Schedule form
  const [scheduleClassTypeId, setScheduleClassTypeId] = useState("");
  const [scheduleInstructorId, setScheduleInstructorId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");

  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createClassType(selectedGymId, {
        name: typeName,
        description: typeDescription,
        durationMinutes: parseInt(duration),
        maxCapacity: parseInt(capacity),
      });

      if ("error" in result) {
        toast.error("Failed to create class type");
        return;
      }

      toast.success("Class type created");
      setIsAddTypeOpen(false);
      setTypeName("");
      setTypeDescription("");
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const classType = classTypes.find((c) => c.id === scheduleClassTypeId);
      if (!classType) {
        toast.error("Please select a class type");
        return;
      }

      const result = await createClassScheduleAction(classType.gymId, {
        classTypeId: scheduleClassTypeId,
        instructorId: scheduleInstructorId || undefined,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        room: room || undefined,
      });

      if ("error" in result) {
        toast.error("Failed to create schedule");
        return;
      }

      toast.success("Class scheduled");
      setIsAddScheduleOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (gyms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No gyms available</p>
          <p className="text-sm text-muted-foreground">Create a gym first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="types" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="types">Class Types</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="types" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isAddTypeOpen} onOpenChange={setIsAddTypeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Class Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateType}>
                <DialogHeader>
                  <DialogTitle>Add Class Type</DialogTitle>
                  <DialogDescription>
                    Define a new type of class for your gym
                  </DialogDescription>
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
                          <SelectItem key={gym.id} value={gym.id}>
                            {gym.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      placeholder="Yoga"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={typeDescription}
                      onChange={(e) => setTypeDescription(e.target.value)}
                      placeholder="Morning yoga session"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Capacity</Label>
                      <Input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {classTypes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No class types yet. Add your first class type.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: type.color || "#3b82f6" }}
                    />
                    {type.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {type.description && (
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {type.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {type.maxCapacity} max
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="schedule" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
            <DialogTrigger asChild>
              <Button disabled={classTypes.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSchedule}>
                <DialogHeader>
                  <DialogTitle>Schedule Class</DialogTitle>
                  <DialogDescription>Add a recurring class to the schedule</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Class Type</Label>
                    <Select value={scheduleClassTypeId} onValueChange={setScheduleClassTypeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class type" />
                      </SelectTrigger>
                      <SelectContent>
                        {classTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructor</Label>
                    <Select value={scheduleInstructorId} onValueChange={setScheduleInstructorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.firstName} {t.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {getDayName(d)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Studio A" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Scheduling..." : "Schedule"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {schedules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No classes scheduled. Add a schedule.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: s.classType.color || "#3b82f6" }}
                      />
                      <div>
                        <div className="font-medium">{s.classType.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getDayName(s.dayOfWeek)} {formatTime(s.startTime)} - {formatTime(s.endTime)}
                          {s.room && ` • ${s.room}`}
                        </div>
                      </div>
                    </div>
                    {s.instructor && (
                      <Badge variant="secondary">
                        {s.instructor.firstName} {s.instructor.lastName}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
