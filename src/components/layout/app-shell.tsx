import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomTabBar } from "./bottom-tab-bar";
import { redirect } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export async function AppShell({ children, requireAuth = false }: AppShellProps) {
  const user = await getCurrentUser();

  if (requireAuth && !user) {
    redirect("/login");
  }

  // Fallback demo user if not logged in
  const activeUser = user || {
    id: "guest-user",
    email: "guest@bootcampbd.com",
    profile: {
      id: "guest-user",
      handle: "guest",
      full_name: "Guest Learner",
      avatar_url: null,
      headline: "Exploring Bootcamp BD",
      bio: "",
      country: "BD",
      timezone: "Asia/Dhaka",
      locale: "en",
      preferred_currency: "BDT" as const,
      website: null,
      socials: {},
      intent: "learn" as const,
      creator_status: "none" as const,
      onboarding_completed_at: null,
      is_suspended: false,
      last_seen_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ["student"] as any[],
    isCreator: false,
    isStaff: false,
    isAdmin: false,
  };

  return (
    <div className="min-h-screen bg-canvas flex text-ink">
      {/* Clamped 15% Left Rail (Desktop only) */}
      <div className="hidden lg:block shrink-0 w-[clamp(232px,15%,300px)]">
        <Sidebar user={activeUser} />
      </div>

      {/* 85% Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar user={activeUser} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}
