import { BottomNav } from "@/components/bottom-nav";
import { MemberCheck } from "@/components/member-check";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemberCheck>
      <div className="min-h-screen pb-20">
        <main className="p-4">
          {children}
        </main>
        <BottomNav />
      </div>
    </MemberCheck>
  );
}
