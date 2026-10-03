import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/cards/stat-tile";
import { Plus, BookOpen, Users, DollarSign, ArrowUpRight } from "lucide-react";
import { formatBDT } from "@/lib/utils/format-currency";

export default function StudioDashboardPage() {
  const stats = [
    { label: "Net Revenue (This Month)", value: "৳284,500", change: 18.4, period: "vs last month" },
    { label: "Total Enrolled Students", value: "2,420", change: 12.1, period: "active learners" },
    { label: "Published Courses", value: "4", change: 0, period: "1 in review" },
    { label: "Community Members", value: "1,420", change: 24.5, period: "guild members" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Studio Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Creator Studio
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Manage your courses, view student engagement, and monitor bi-weekly payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/studio/courses">
              <Button variant="primary" size="md" className="font-bold">
                <Plus className="h-4 w-4 mr-1.5" />
                New Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>

        {/* Courses Table / List */}
        <div className="p-6 rounded-3xl bg-surface-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">My Published Offerings</h2>
            <Link href="/studio/courses" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink">Production Next.js 15 & Full-Stack Architecture</p>
                <p className="text-xs text-ink-muted">Published &bull; 842 students &bull; ৳3,500</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                Live
              </span>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink">SaaS Starter Kit for Next.js 15 & Supabase</p>
                <p className="text-xs text-ink-muted">Digital Product &bull; 512 sales &bull; ৳2,900</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                Live
              </span>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink">Full-Stack Founders Guild</p>
                <p className="text-xs text-ink-muted">Community &bull; 1,420 members &bull; ৳990/mo</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                Active Guild
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
