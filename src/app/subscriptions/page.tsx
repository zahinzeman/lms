import { AppShell } from "@/components/layout/app-shell";
import { formatBDT } from "@/lib/utils/format-currency";
import { Repeat, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  const subscriptions = [
    {
      id: "sub-1",
      community: "Full-Stack Founders Guild",
      creator: "Tanvir Hossain",
      priceMonthlyMinor: 99000,
      nextBilling: "March 15, 2025",
      status: "Active",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Repeat className="h-6 w-6 text-accent" />
            <span>Active Subscriptions</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Manage your monthly community memberships and all-access creator plans.
          </p>
        </div>

        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="p-6 rounded-3xl bg-surface-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" />
                    {sub.status}
                  </span>
                  <span className="text-xs text-ink-muted">Renews on {sub.nextBilling}</span>
                </div>
                <h3 className="text-base font-bold text-ink">{sub.community}</h3>
                <p className="text-xs text-ink-muted">By {sub.creator}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <span className="text-base font-black text-ink">
                  {formatBDT(sub.priceMonthlyMinor)} / mo
                </span>
                <Button size="sm" variant="secondary" className="text-xs font-bold text-red-500 hover:text-red-600">
                  Cancel Membership
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
