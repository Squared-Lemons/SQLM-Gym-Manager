"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/ui";
import { Plus, MoreVertical, Pencil, Trash2, QrCode } from "lucide-react";
import { createMember, updateMember, deleteMember, updateMemberStatus } from "@/lib/actions/members";
import { formatDate } from "@app/api/client";

type Member = {
  id: string;
  gymId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  memberNumber: string;
  qrCode: string;
  status: "active" | "inactive" | "suspended" | "cancelled";
  joinDate: Date;
};

type Gym = {
  id: string;
  name: string;
};

export function MembersList({
  initialMembers,
  gyms,
}: {
  initialMembers: Member[];
  gyms: Gym[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGymFilter, setSelectedGymFilter] = useState<string>("all");

  // Form state
  const [selectedGymId, setSelectedGymId] = useState(gyms[0]?.id || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const filteredMembers =
    selectedGymFilter === "all"
      ? members
      : members.filter((m) => m.gymId === selectedGymFilter);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSelectedGymId(gyms[0]?.id || "");
    setEditingMember(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingMember) {
        const result = await updateMember(editingMember.id, {
          firstName,
          lastName,
          email,
          phone,
        });
        if ("error" in result) {
          toast.error("Failed to update member");
          return;
        }
        toast.success("Member updated");
        setMembers(
          members.map((m) =>
            m.id === editingMember.id
              ? { ...m, firstName, lastName, email, phone }
              : m
          )
        );
      } else {
        const result = await createMember(selectedGymId, {
          firstName,
          lastName,
          email,
          phone,
        });
        if ("error" in result) {
          toast.error("Failed to create member");
          return;
        }
        toast.success("Member created");
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

  async function handleDelete(member: Member) {
    if (
      !confirm(`Are you sure you want to delete "${member.firstName} ${member.lastName}"?`)
    )
      return;

    try {
      await deleteMember(member.id);
      setMembers(members.filter((m) => m.id !== member.id));
      toast.success("Member deleted");
    } catch (error) {
      toast.error("Failed to delete member");
    }
  }

  async function handleStatusChange(
    member: Member,
    status: "active" | "inactive" | "suspended" | "cancelled"
  ) {
    try {
      await updateMemberStatus(member.id, status);
      setMembers(members.map((m) => (m.id === member.id ? { ...m, status } : m)));
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  function openEdit(member: Member) {
    setEditingMember(member);
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setSelectedGymId(member.gymId);
    setIsAddOpen(true);
  }

  function getGymName(gymId: string) {
    return gyms.find((g) => g.id === gymId)?.name || "Unknown";
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "active":
        return "success" as const;
      case "inactive":
        return "secondary" as const;
      case "suspended":
        return "warning" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }

  if (gyms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No gyms available</p>
          <p className="text-sm text-muted-foreground">
            Create a gym first to add members
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={selectedGymFilter} onValueChange={setSelectedGymFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by gym" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gyms</SelectItem>
            {gyms.map((gym) => (
              <SelectItem key={gym.id} value={gym.id}>
                {gym.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Member" : "Add New Member"}
                </DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Update member details"
                    : "Register a new member at your gym"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!editingMember && (
                  <div className="space-y-2">
                    <Label htmlFor="gym">Gym *</Label>
                    <Select value={selectedGymId} onValueChange={setSelectedGymId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a gym" />
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
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingMember ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No members yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first member to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Member #</TableHead>
                <TableHead>Gym</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {member.memberNumber}
                  </TableCell>
                  <TableCell>{getGymName(member.gymId)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {member.email && <div>{member.email}</div>}
                      {member.phone && (
                        <div className="text-muted-foreground">{member.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(member.joinDate)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(member)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              member,
                              member.status === "active" ? "inactive" : "active"
                            )
                          }
                        >
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(member)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
