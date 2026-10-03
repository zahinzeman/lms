import Link from "next/link";
import { getTopCreators } from "@/lib/data/creators";
import { CreatorCard } from "@/components/cards/creator-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ArrowRight } from "lucide-react";

export async function TopCreators() {
  const creators = await getTopCreators(6);

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <SectionHeader
          title="Learn from Industry Leaders"
          description="Senior tech leads, lead product designers, and agency founders who share their actual playbooks."
        />
        <Link
          href="/explore"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
        >
          <span>View all creators</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {creators.map((c) => (
          <CreatorCard key={c.id} creator={c as any} />
        ))}
      </div>
    </section>
  );
}
