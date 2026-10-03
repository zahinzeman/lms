import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Sparkles, Check, ArrowRight } from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Airbnb-Inspired Flat Design System</span>
          </div>
          <h1 className="text-4xl font-black text-ink tracking-tight">
            Design Tokens & Components
          </h1>
          <p className="text-sm text-ink-muted">
            Strictly flat design: zero decorative borders, zero box-shadows, and tonal separation via canvas, surface-1, surface-2, and surface-3.
          </p>
        </div>

        {/* Tone Ladder */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Surface Tone Ladder</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
            <div className="p-6 rounded-2xl bg-canvas text-ink ring-1 ring-surface-3">
              Canvas (Root)
            </div>
            <div className="p-6 rounded-2xl bg-surface-1 text-ink">
              Surface 1 (Base Cards)
            </div>
            <div className="p-6 rounded-2xl bg-surface-2 text-ink">
              Surface 2 (Elevated)
            </div>
            <div className="p-6 rounded-2xl bg-surface-3 text-ink">
              Surface 3 (Hover / Muted)
            </div>
          </div>
        </div>

        {/* Accent Colors */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Brand Accent</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div className="p-6 rounded-2xl bg-accent text-accent-fg flex items-center justify-between">
              <span>Rausch Accent</span>
              <span>#FF385C</span>
            </div>
            <div className="p-6 rounded-2xl bg-accent/10 text-accent flex items-center justify-between">
              <span>Accent Tint</span>
              <span>10% Alpha</span>
            </div>
            <div className="p-6 rounded-2xl bg-ink text-canvas flex items-center justify-between">
              <span>Deep Ink</span>
              <span>#222222</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" size="md" className="font-bold">
              Primary (Rausch)
            </Button>
            <Button variant="secondary" size="md" className="font-bold">
              Secondary (Surface)
            </Button>
            <Button variant="ghost" size="md" className="font-bold">
              Ghost Button
            </Button>
            <Button variant="dark" size="md" className="font-bold">
              Dark Button
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
