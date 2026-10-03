"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { learningNav, creatorNav, adminNav, NavGroup } from "@/config/nav";
import { SessionUser } from "@/types/auth";
import {
  Home, Compass, GraduationCap, Users, FolderDown, Heart, Award, Bell,
  Receipt, Repeat, Settings, LayoutDashboard, BarChart3, BookOpen, Boxes,
  Users2, BadgePercent, UserCheck, MessageSquare, Ticket, DollarSign,
  CreditCard, Store, Sliders, Shield, TrendingUp, FileSignature, BookCheck,
  Package, MessagesSquare, FolderTree, Banknote, Tag, Coins, Flag,
  FileText, Layers, SlidersHorizontal, ChevronRight, LogOut, LucideIcon
} from "lucide-react";

interface SidebarProps {
  user: SessionUser;
  collapsed?: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  Home, Compass, GraduationCap, Users, FolderDown, Heart, Award, Bell,
  Receipt, Repeat, Settings, LayoutDashboard, BarChart3, BookOpen, Boxes,
  Users2, BadgePercent, UserCheck, MessageSquare, Ticket, DollarSign,
  CreditCard, Store, Sliders, Shield, TrendingUp, FileSignature, BookCheck,
  Package, MessagesSquare, FolderTree, Banknote, Tag, Coins, Flag,
  FileText, Layers, SlidersHorizontal
};

export function Sidebar({ user, collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  // Determine current active workspace based on route
  let activeWorkspace: "learning" | "creator" | "admin" = "learning";
  let navGroups: NavGroup[] = learningNav;

  if (pathname.startsWith("/admin")) {
    activeWorkspace = "admin";
    navGroups = adminNav;
  } else if (pathname.startsWith("/studio")) {
    activeWorkspace = "creator";
    navGroups = creatorNav;
  }

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-surface-1 select-none transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-full max-w-[280px]"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-fg font-black text-lg transition-transform group-hover:scale-105">
            B
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-ink leading-tight">
                {siteConfig.name}
              </span>
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                {activeWorkspace === "admin" ? "Admin Console" : activeWorkspace === "creator" ? "Creator Studio" : "Learner Hub"}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Workspace Switcher / Toggle */}
      {!collapsed && (user.isCreator || user.isStaff) && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-xl text-xs font-semibold">
            <Link
              href="/dashboard"
              className={`flex-1 text-center py-1.5 rounded-lg transition-colors ${
                activeWorkspace === "learning" ? "bg-canvas text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              Learn
            </Link>
            {user.isCreator && (
              <Link
                href="/studio"
                className={`flex-1 text-center py-1.5 rounded-lg transition-colors ${
                  activeWorkspace === "creator" ? "bg-canvas text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                Studio
              </Link>
            )}
            {user.isStaff && (
              <Link
                href="/admin"
                className={`flex-1 text-center py-1.5 rounded-lg transition-colors ${
                  activeWorkspace === "admin" ? "bg-canvas text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted/80 mb-2">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] || Home;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/studio" && item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-ink-muted hover:text-ink hover:bg-surface-2"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-accent" : "text-ink-muted"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Card */}
      <div className="p-3 bg-surface-2/60 mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center shrink-0 text-sm">
            {user.profile.full_name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-ink truncate">
                {user.profile.full_name || "Student"}
              </span>
              <span className="text-[11px] text-ink-muted truncate">
                @{user.profile.handle}
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
