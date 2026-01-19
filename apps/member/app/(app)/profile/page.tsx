import { getMemberProfile } from "@/lib/actions/member";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Separator } from "@app/ui";
import { formatDate } from "@app/api";
import { redirect } from "next/navigation";
import { ProfileActions } from "./profile-actions";

export default async function ProfilePage() {
  const profile = await getMemberProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your membership details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">
              {profile.firstName} {profile.lastName}
            </span>
          </div>
          {profile.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{profile.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Membership Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member Number</span>
            <span className="font-mono">{profile.memberNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gym</span>
            <span>{profile.gym?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={profile.status === "active" ? "success" : "secondary"}>
              {profile.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member Since</span>
            <span>{formatDate(profile.joinDate)}</span>
          </div>
          {profile.expiryDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span>{formatDate(profile.expiryDate)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <ProfileActions />
    </div>
  );
}
