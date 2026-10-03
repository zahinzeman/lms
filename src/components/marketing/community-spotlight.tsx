import Link from "next/link";
import { Community } from "@/types/community";
import { CommunityCard } from "@/components/cards/community-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ArrowRight, Sparkles } from "lucide-react";

interface CommunitySpotlightProps {
  communities: Community[];
}

export function CommunitySpotlight({ communities }: CommunitySpotlightProps) {
  return (
    <section className="py-14 sm:py-20 bg-surface-1/40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Skool-Style Gamification</span>
            </div>
            <SectionHeader
              title="Thriving Creator Communities"
              description="Connect directly with instructors and peers. Level up from 1 to 9, join live office hours, and get real feedback."
            />
          </div>
          <Link
            href="/communities"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
          >
            <span>Browse all communities</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.slice(0, 3).map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </div>
    </section>
  );
}
