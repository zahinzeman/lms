"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, GraduationCap, Users, User } from "lucide-react";

export function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Learning", href: "/learning", icon: GraduationCap },
    { label: "Community", href: "/communities", icon: Users },
    { label: "Profile", href: "/settings", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface-1/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
              isActive ? "text-accent font-bold" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
