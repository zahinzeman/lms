"use client";

import { useState } from "react";
import Link from "next/link";
import { creatorPlans } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { formatBDT } from "@/lib/utils/format-currency";

export function CreatorPlans() {
  const [billing, setBilling] = useState<"month" | "year">("year");

  return (
    <section className="py-16 sm:py-24 bg-surface-1/50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight mb-4">
          Fair creator plans. Keep what you earn.
        </h2>
        <p className="text-base text-ink-muted max-w-xl mx-auto mb-8">
          Start for free with zero financial risk, or upgrade to Pro to lower your fee to just 5%.
        </p>

        {/* Month / Year toggle */}
        <div className="inline-flex p-1 rounded-full bg-surface-2 text-xs font-bold mb-12">
          <button
            onClick={() => setBilling("month")}
            className={`px-4 py-2 rounded-full transition-all ${
              billing === "month" ? "bg-surface-1 text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBilling("year")}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              billing === "year" ? "bg-accent text-accent-fg" : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>Yearly Billing</span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-extrabold">
              Save 20%
            </span>
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {creatorPlans.map((plan) => {
            const price = billing === "year" ? plan.yearlyPriceBDT / 12 : plan.monthlyPriceBDT;
            const isPro = plan.id === "pro";

            return (
              <div
                key={plan.id}
                className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                  isPro ? "bg-surface-2 ring-2 ring-accent" : "bg-surface-1"
                }`}
              >
                <div>
                  {isPro && (
                    <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-fg text-[11px] font-extrabold uppercase tracking-wider mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-ink">{plan.name}</h3>
                  <p className="text-xs text-ink-muted mt-1 mb-6">{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-ink">
                      {price === 0 ? "৳0" : formatBDT(price)}
                    </span>
                    <span className="text-xs text-ink-muted">/ month</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-3/60 mb-6 text-xs font-bold text-ink">
                    <span className="text-accent">{plan.feePercentage}%</span> platform transaction fee
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs font-semibold text-ink leading-relaxed">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Link href="/become-creator" className="block">
                    <Button
                      variant={isPro ? "primary" : "secondary"}
                      size="lg"
                      className="w-full font-bold h-12"
                    >
                      {plan.id === "free" ? "Start Free" : `Upgrade to ${plan.name}`}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
