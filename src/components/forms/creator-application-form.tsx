"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, ArrowRight } from "lucide-react";

export function CreatorApplicationForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-ink">Application Submitted!</h1>
        <p className="text-sm text-ink-muted">
          Our creator review committee reviews applications within 24-48 hours. We will email you once approved so you can start uploading courses in Creator Studio.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Join 340+ Verified Instructors</span>
        </div>
        <h1 className="text-3xl font-black text-ink tracking-tight">
          Apply as a Creator
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Share what you plan to teach. We approve instructors who demonstrate real-world experience and clear teaching goals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-1 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              What is your teaching domain or niche?
            </label>
            <Input
              required
              placeholder="e.g. Next.js Architecture, Figma Design Systems, Meta Ads, Prompt Engineering"
              className="bg-surface-2 h-11"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Summary of your professional experience
            </label>
            <Textarea
              required
              placeholder="Briefly describe your background, years in industry, and projects you have shipped..."
              className="bg-surface-2 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Portfolio or LinkedIn / GitHub Link
            </label>
            <Input
              required
              type="url"
              placeholder="https://linkedin.com/in/... or github.com/..."
              className="bg-surface-2 h-11"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Estimated current audience size (optional)
            </label>
            <select className="w-full bg-surface-2 h-11 rounded-xl px-4 text-xs font-semibold text-ink focus:outline-none">
              <option value="0-1k">Just starting out (0 - 1,000 followers/students)</option>
              <option value="1k-10k">Growing audience (1,000 - 10,000 followers)</option>
              <option value="10k-100k">Established creator (10,000 - 100,000 followers)</option>
              <option value="100k+">Macro authority (100,000+ followers)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full font-bold h-12">
            <span>Submit Creator Application</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
