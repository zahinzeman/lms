"use client";

import Link from "next/link";
import { SearchPill } from "@/components/ui/search-pill";
import { Avatar } from "@/components/ui/avatar";
import { SessionUser } from "@/types/auth";
import { Bell, ShoppingCart, Sparkles, Check } from "lucide-react";
import { setDemoRoleAction } from "@/lib/auth/actions";
import { useState } from "react";

interface TopbarProps {
  user: SessionUser;
}

export function Topbar({ user }: TopbarProps) {
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);

  const handleRoleChange = async (role: "student" | "creator" | "admin") => {
    setRoleSelectOpen(false);
    await setDemoRoleAction(role);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-canvas/90 backdrop-blur-md px-6">
      {/* Search pill */}
      <div className="w-64 lg:w-80 shrink-0">
        <SearchPill compact placeholder="Search courses, lessons, discussions..." />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
        {/* Quick Demo Role Picker Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleSelectOpen(!roleSelectOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-1 hover:bg-surface-2 text-xs font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="capitalize whitespace-nowrap">
              {user.isAdmin ? "Admin View" : user.isCreator ? "Creator View" : "Student View"}
            </span>
          </button>

          {roleSelectOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface-1 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Switch Preview Role
              </div>
              <button
                onClick={() => handleRoleChange("student")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface-2"
              >
                <span>Student</span>
                {!user.isCreator && !user.isAdmin && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                onClick={() => handleRoleChange("creator")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface-2"
              >
                <span>Creator</span>
                {user.isCreator && !user.isAdmin && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
              <button
                onClick={() => handleRoleChange("admin")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface-2"
              >
                <span>Admin</span>
                {user.isAdmin && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-surface-1 text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-1 text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          aria-label="Cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Link>

        {/* User avatar */}
        <Link href="/settings" className="ml-1">
          <Avatar
            src={user.profile.avatar_url || undefined}
            name={user.profile.full_name || "User"}
            size={32}
          />
        </Link>
      </div>
    </header>
  );
}
