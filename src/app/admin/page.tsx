import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatTile } from "@/components/cards/stat-tile";
import { Button } from "@/components/ui/button";
import { Shield, FileSignature, BookCheck, Users, AlertCircle } from "lucide-react";

export default function AdminConsolePage() {
  const stats = [
    { label: "Platform Volume (30d)", value: "৳4.2Cr+", change: 22.8, period: "gross merchandise" },
    { label: "Total Platform Users", value: "85,420", change: 14.5, period: "registered accounts" },
    { label: "Pending Course Reviews", value: "6", change: -2, period: "needs staff review" },
    { label: "Creator Applications", value: "14", change: 5, period: "pending review" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Staff Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Review creator applications, moderate submitted courses, and monitor platform compliance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>

        {/* Review Queues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator Applications Queue */}
          <div className="p-6 rounded-3xl bg-surface-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-accent" />
                <span>Pending Creator Applications (14)</span>
              </h2>
            </div>

            <div className="space-y-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">Rashidul Karim</p>
                  <p className="text-xs text-ink-muted">Flutter & Dart Mobile Architecture</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="text-xs font-bold">Review</Button>
                </div>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">Farhana Yasmin</p>
                  <p className="text-xs text-ink-muted">SEO & High-Converting Content Strategy</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="text-xs font-bold">Review</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Review Queue */}
          <div className="p-6 rounded-3xl bg-surface-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <BookCheck className="h-4 w-4 text-emerald-500" />
                <span>Course Review Queue (6)</span>
              </h2>
            </div>

            <div className="space-y-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">Postgres Performance & Sharding</p>
                  <p className="text-xs text-ink-muted">By Tanvir Hossain &bull; 14 lessons submitted</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="text-xs font-bold">Approve</Button>
                </div>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">Prompt Engineering for LLM Agents</p>
                  <p className="text-xs text-ink-muted">By Farhan Ahmed &bull; 22 lessons submitted</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="text-xs font-bold">Approve</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
