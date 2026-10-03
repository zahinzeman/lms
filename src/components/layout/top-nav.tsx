"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SearchPill } from "@/components/ui/search-pill";
import { Compass, ShoppingCart, Sparkles, BookOpen, Layers } from "lucide-react";
import { SessionUser } from "@/types/auth";

interface TopNavProps {
  user?: SessionUser | null;
}

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-1/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 xl:gap-8 shrink-0 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg font-black text-lg transition-transform group-hover:scale-105">
              B
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-base font-extrabold tracking-tight text-ink leading-none whitespace-nowrap">
                {siteConfig.name}
              </span>
              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mt-0.5 whitespace-nowrap">
                Academy & Hub
              </span>
            </div>
          </Link>

          {/* Search Pill */}
          <div className="hidden md:block w-48 lg:w-60 xl:w-72 shrink-0">
            <SearchPill compact />
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold shrink-0">
          <Link
            href="/explore"
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              pathname === "/explore" ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Compass className="h-4 w-4 text-accent" />
              Explore
            </span>
          </Link>

          <Link
            href="/communities"
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith("/communities") ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Communities
            </span>
          </Link>

          <Link
            href="/teach"
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              pathname === "/teach" ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span className="whitespace-nowrap">
              <span className="hidden xl:inline">Teach on {siteConfig.shortName}</span>
              <span className="xl:hidden">Teach</span>
            </span>
          </Link>

          <Link
            href="/pricing"
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              pathname === "/pricing" ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span className="whitespace-nowrap">Pricing</span>
          </Link>
        </nav>

        {/* Right CTA / User controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Link href="/dashboard" className="shrink-0">
                <Button size="sm" variant="secondary" className="hidden sm:inline-flex whitespace-nowrap">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
                <Avatar
                  src={user.profile.avatar_url || undefined}
                  name={user.profile.full_name || "User"}
                  size={32}
                />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Link href="/login" className="shrink-0">
                <Button size="sm" variant="ghost" className="whitespace-nowrap px-3">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" className="shrink-0">
                <Button size="sm" variant="primary" className="whitespace-nowrap px-3.5">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
