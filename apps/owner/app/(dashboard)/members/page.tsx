import { getAllMembers } from "@/lib/actions/members";
import { getGyms } from "@/lib/actions/gyms";
import { MembersList } from "./members-list";

export default async function MembersPage() {
  const [members, gyms] = await Promise.all([getAllMembers(), getGyms()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Members</h1>
        <p className="text-muted-foreground">
          Manage gym members and their memberships
        </p>
      </div>

      <MembersList initialMembers={members} gyms={gyms} />
    </div>
  );
}
