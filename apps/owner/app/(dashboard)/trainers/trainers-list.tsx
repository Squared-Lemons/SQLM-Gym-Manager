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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@app/ui";
import { Plus, Mail, Phone, DollarSign } from "lucide-react";
import { createTrainer, deleteTrainer, toggleTrainerActive } from "@/lib/actions/trainers";
import { formatCurrency } from "@app/api/client";

type Trainer = {
  id: string;
  gymId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  specialties: string | null;
  hourlyRate: number | null;
  isActive: boolean;
};

type Gym = { id: string; name: string };

export function TrainersList({
  initialTrainers,
  gyms,
}: {
  initialTrainers: Trainer[];
  gyms: Gym[];
}) {
  const [trainers, setTrainers] = useState(initialTrainers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedGymId, setSelectedGymId] = useState(gyms[0]?.id || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setBio("");
    setHourlyRate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createTrainer(selectedGymId, {
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        hourlyRate: hourlyRate ? parseInt(hourlyRate) * 100 : undefined,
      });

      if ("error" in result) {
        toast.error("Failed to create trainer");
        return;
      }

      toast.success("Trainer added");
      setIsAddOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(trainer: Trainer) {
    if (!confirm(`Delete ${trainer.firstName} ${trainer.lastName}?`)) return;

    try {
      await deleteTrainer(trainer.id);
      setTrainers(trainers.filter((t) => t.id !== trainer.id));
      toast.success("Trainer deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleToggleActive(trainer: Trainer) {
    try {
      await toggleTrainerActive(trainer.id, !trainer.isActive);
      setTrainers(
        trainers.map((t) =>
          t.id === trainer.id ? { ...t, isActive: !trainer.isActive } : t
        )
      );
      toast.success(trainer.isActive ? "Trainer deactivated" : "Trainer activated");
    } catch {
      toast.error("Failed to update");
    }
  }

  function getGymName(gymId: string) {
    return gyms.find((g) => g.id === gymId)?.name || "Unknown";
  }

  if (gyms.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Create a gym first to add trainers
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Trainer</DialogTitle>
                <DialogDescription>Add a new personal trainer</DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate ($)</Label>
                  <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="75" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief description..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Trainer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {trainers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No trainers yet. Add your first trainer.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <Card key={trainer.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{trainer.firstName} {trainer.lastName}</span>
                  <Badge variant={trainer.isActive ? "default" : "secondary"}>
                    {trainer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{getGymName(trainer.gymId)}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {trainer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {trainer.email}
                  </div>
                )}
                {trainer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {trainer.phone}
                  </div>
                )}
                {trainer.hourlyRate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(trainer.hourlyRate)}/hr
                  </div>
                )}
                {trainer.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{trainer.bio}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(trainer)}
                  >
                    {trainer.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(trainer)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
