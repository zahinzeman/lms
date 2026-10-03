"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils/format-currency";
import { ArrowRight, Calculator, Sparkles } from "lucide-react";

export function BecomeCreatorBand() {
  const [students, setStudents] = useState<number>(150);
  const [priceBDT, setPriceBDT] = useState<number>(2500);

  // Pro tier keeps 95%
  const totalGrossBDT = students * priceBDT;
  const netEarningsBDT = totalGrossBDT * 0.95;

  return (
    <section className="py-16 sm:py-24 bg-surface-1 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator Economy in Bangladesh</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-tight">
              Calculate your earnings potential on Bootcamp BD
            </h2>

            <p className="text-base text-ink-muted leading-relaxed">
              Whether you teach full-stack architecture, 3D motion, or digital marketing, you own your audience, your pricing, and your course materials.
            </p>

            <div className="space-y-3 text-sm font-semibold text-ink">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>Zero hosting or bandwidth video fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>Instant local bKash, Nagad & Bank settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>Skool-style community + Course builder unified</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/become-creator">
                <Button size="lg" variant="primary" className="h-12 px-8 font-bold">
                  <span>Apply to Teach</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Interactive Calculator Box */}
          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-surface-2 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-accent" />
                  Interactive Estimator
                </span>
                <span className="text-xs font-bold text-accent">Pro Plan (5% fee)</span>
              </div>

              {/* Slider 1: Students */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Enrolled Students</span>
                  <span className="text-accent">{students} students</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={students}
                  onChange={(e) => setStudents(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-surface-3 accent-accent cursor-pointer"
                />
              </div>

              {/* Slider 2: Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Course / Membership Price</span>
                  <span className="text-accent">৳{priceBDT.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={priceBDT}
                  onChange={(e) => setPriceBDT(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-surface-3 accent-accent cursor-pointer"
                />
              </div>

              {/* Result display */}
              <div className="p-6 rounded-2xl bg-surface-1 text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Estimated Take-Home Revenue
                </p>
                <p className="text-4xl font-black text-ink">
                  {formatBDT(netEarningsBDT * 100)}
                </p>
                <p className="text-xs text-ink-muted">
                  Gross: {formatBDT(totalGrossBDT * 100)} &bull; Platform fee: 5%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
