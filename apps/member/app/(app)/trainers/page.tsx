import { getGymTrainers } from "@/lib/actions/member";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@app/ui";
import { Mail, Phone, DollarSign } from "lucide-react";
import { formatCurrency } from "@app/api";

export default async function TrainersPage() {
  const trainers = await getGymTrainers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Personal Trainers</h1>
        <p className="text-muted-foreground">
          Meet our certified trainers
        </p>
      </div>

      {trainers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No trainers available at your gym yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trainers.map((trainer) => {
            const specialties = trainer.specialties
              ? JSON.parse(trainer.specialties)
              : [];

            return (
              <Card key={trainer.id}>
                <CardHeader>
                  <CardTitle>
                    {trainer.firstName} {trainer.lastName}
                  </CardTitle>
                  {trainer.bio && (
                    <CardDescription>{trainer.bio}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {specialties.map((s: string) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {trainer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {trainer.email}
                      </div>
                    )}
                    {trainer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {trainer.phone}
                      </div>
                    )}
                    {trainer.hourlyRate && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(trainer.hourlyRate)}/hour
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
