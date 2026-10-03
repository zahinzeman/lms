import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-surface-2 p-8 sm:p-14 lg:p-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Join the Next Generation</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight max-w-2xl mx-auto mb-4">
          Ready to learn skills that pay or teach what you know?
        </h2>

        <p className="text-base text-ink-muted max-w-lg mx-auto mb-8">
          Join over 28,000+ engineers, designers, and creators in Bangladesh building the future of digital skills.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/explore">
            <Button size="lg" variant="primary" className="h-12 px-8 font-bold">
              <span>Start Exploring</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/become-creator">
            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold">
              Apply to Teach
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
