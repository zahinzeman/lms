import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { getCommunities } from "@/lib/data/communities";
import { CommunityCard } from "@/components/cards/community-card";
import { Sparkles } from "lucide-react";

export default async function CommunitiesPage() {
  const user = await getCurrentUser();
  const communities = await getCommunities();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Skool-Style Gamified Hubs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
            Creator Communities
          </h1>
          <p className="text-sm text-ink-muted">
            Join private student guilds, level up your rank by contributing, and attend weekly live office hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
