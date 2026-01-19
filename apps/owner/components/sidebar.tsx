"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@app/ui";
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Dumbbell,
  CreditCard,
  Receipt,
  LogOut,
} from "lucide-react";
import { signOut } from "@app/auth/client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Gyms", href: "/gyms", icon: Building2 },
  { name: "Members", href: "/members", icon: Users },
  { name: "Classes", href: "/classes", icon: Calendar },
  { name: "Trainers", href: "/trainers", icon: Dumbbell },
  { name: "Plans", href: "/plans", icon: CreditCard },
  { name: "Payments", href: "/payments", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6" />
          <span className="font-semibold">Gym Manager</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
