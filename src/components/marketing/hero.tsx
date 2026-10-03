"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SearchPill } from "@/components/ui/search-pill";
import { Sparkles, ArrowRight, ShieldCheck, Users, Play, Award } from "lucide-react";
import Image from "next/image";

export function Hero() {
  const [audience, setAudience] = useState<"learn" | "teach">("learn");

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Toggle Pill: Learn vs Teach */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-surface-2 text-xs font-bold">
            <button
              onClick={() => setAudience("learn")}
              className={`px-4 py-2 rounded-full cursor-pointer transition-all ${
                audience === "learn"
                  ? "bg-accent text-accent-fg"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              I want to Learn
            </button>
            <button
              onClick={() => setAudience("teach")}
              className={`px-4 py-2 rounded-full cursor-pointer transition-all ${
                audience === "teach"
                  ? "bg-accent text-accent-fg"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              I want to Teach & Earn
            </button>
          </div>
        </div>

        {audience === "learn" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen Learning × Skool Community</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.08]">
                Learn skills that pay.{" "}
                <span className="text-accent underline decoration-accent/30 underline-offset-8">
                  From practitioners
                </span>{" "}
                who ship.
              </h1>

              <p className="text-lg text-ink-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Step away from generic video playlists. Master full-stack development, Figma design systems, AI engineering, and high-income freelancing with weekly project roasts and private community access.
              </p>

              {/* Big Search Pill */}
              <div className="w-full max-w-xl mx-auto lg:mx-0">
                <SearchPill placeholder="Try 'Next.js 15', 'Figma Tokens', or 'Meta Ads'..." />
              </div>

              {/* Social Proof Stats */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-ink-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Verified Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>28,000+ Active Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  <span>4.9/5 Average Rating</span>
                </div>
              </div>
            </div>

            {/* Right Photo Mosaic */}
            <div className="lg:col-span-5 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-surface-2">
                    <Image
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                      alt="Collaborative learning"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-2 text-ink">
                    <p className="text-xs font-bold text-accent uppercase">Live Community</p>
                    <p className="text-sm font-bold mt-1">9 Gamified Levels & Weekly Critiques</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="p-4 rounded-2xl bg-accent text-accent-fg">
                    <p className="text-2xl font-black">৳3.2M+</p>
                    <p className="text-xs font-medium text-white/90 mt-0.5">Paid out to top instructors this month</p>
                  </div>
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-surface-2">
                    <Image
                      src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80"
                      alt="Student designing"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Creator Mode Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Keep 85% to 100% of your earnings</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.08]">
                Turn your expertise into a{" "}
                <span className="text-accent underline decoration-accent/30 underline-offset-8">
                  recurring business
                </span>.
              </h1>

              <p className="text-lg text-ink-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Sell video courses, downloadable digital toolkits, and monthly subscription communities. Instant local bKash/Nagad checkout with automated bi-weekly bank deposits.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link href="/become-creator">
                  <Button size="lg" variant="primary" className="h-12 px-6 text-base font-bold">
                    <span>Apply as a Creator</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="secondary" className="h-12 px-6 text-base font-bold">
                    View Creator Plans & Fees
                  </Button>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-ink-muted">
                <span>&bull; Zero upfront cost</span>
                <span>&bull; Instant bKash & Bank Payouts</span>
                <span>&bull; Built-in DRM & Video Player</span>
              </div>
            </div>

            {/* Creator Highlights */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-surface-2 p-8 space-y-6 text-ink">
                <h3 className="text-xl font-bold">What top instructors make</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Tanvir Hossain</p>
                      <p className="text-xs text-ink-muted">Full-Stack SaaS Course + Guild</p>
                    </div>
                    <span className="text-base font-black text-accent">৳420,000 /mo</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Samira Khan</p>
                      <p className="text-xs text-ink-muted">Figma Design System + Kits</p>
                    </div>
                    <span className="text-base font-black text-accent">৳280,000 /mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
