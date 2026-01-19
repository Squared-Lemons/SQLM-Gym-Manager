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
  Textarea,
  Switch,
  toast,
} from "@app/ui";
import { Plus, MapPin, Phone, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { createGym, updateGym, deleteGym, toggleGymActive } from "@/lib/actions/gyms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/ui";

type Gym = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  facilities: string | null;
  isActive: boolean;
};

export function GymsList({ initialGyms }: { initialGyms: Gym[] }) {
  const [gyms, setGyms] = useState(initialGyms);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function resetForm() {
    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setEditingGym(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingGym) {
        await updateGym(editingGym.id, {
          name,
          address,
          phone,
          email,
        });
        toast.success("Gym updated");
        setGyms(
          gyms.map((g) =>
            g.id === editingGym.id ? { ...g, name, address, phone, email } : g
          )
        );
      } else {
        await createGym({ name, address, phone, email });
        toast.success("Gym created");
        // Refresh the page to get the new gym
        window.location.reload();
      }

      setIsAddOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(gym: Gym) {
    if (!confirm(`Are you sure you want to delete "${gym.name}"?`)) return;

    try {
      await deleteGym(gym.id);
      setGyms(gyms.filter((g) => g.id !== gym.id));
      toast.success("Gym deleted");
    } catch (error) {
      toast.error("Failed to delete gym");
    }
  }

  async function handleToggleActive(gym: Gym) {
    try {
      await toggleGymActive(gym.id, !gym.isActive);
      setGyms(
        gyms.map((g) =>
          g.id === gym.id ? { ...g, isActive: !gym.isActive } : g
        )
      );
      toast.success(gym.isActive ? "Gym deactivated" : "Gym activated");
    } catch (error) {
      toast.error("Failed to update gym status");
    }
  }

  function openEdit(gym: Gym) {
    setEditingGym(gym);
    setName(gym.name);
    setAddress(gym.address || "");
    setPhone(gym.phone || "");
    setEmail(gym.email || "");
    setIsAddOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Gym
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingGym ? "Edit Gym" : "Add New Gym"}</DialogTitle>
                <DialogDescription>
                  {editingGym
                    ? "Update your gym details"
                    : "Add a new gym location to your business"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Downtown Gym"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 0100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gym@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingGym ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {gyms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No gyms yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first gym to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym) => (
            <Card key={gym.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {gym.name}
                    <Badge variant={gym.isActive ? "default" : "secondary"}>
                      {gym.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{gym.slug}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(gym)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(gym)}>
                      {gym.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(gym)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {gym.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {gym.address}
                  </div>
                )}
                {gym.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {gym.phone}
                  </div>
                )}
                {gym.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {gym.email}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
