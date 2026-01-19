import { getMemberProfile, getMemberBookings } from "@/lib/actions/member";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@app/ui";
import { formatDate, getDayName, formatTime } from "@app/api";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getMemberProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const bookings = await getMemberBookings();
  const upcomingBookings = bookings
    .filter((b) => b.status === "booked" && new Date(b.classDate) >= new Date())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          Welcome, {profile.firstName}!
        </h1>
        <p className="text-muted-foreground">{profile.gym?.name}</p>
      </div>

      <QRCodeDisplay
        qrCode={profile.qrCode}
        memberNumber={profile.memberNumber}
        gymName={profile.gym?.name || "Your Gym"}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Membership Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <Badge variant={profile.status === "active" ? "success" : "secondary"}>
              {profile.status}
            </Badge>
          </div>
          {profile.expiryDate && (
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>Expires</span>
              <span>{formatDate(profile.expiryDate)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Classes</CardTitle>
            <CardDescription>Your next booked sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">
                    {booking.classSchedule.classType.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(booking.classDate)} at{" "}
                    {formatTime(booking.classSchedule.startTime)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
