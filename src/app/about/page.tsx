import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">About Us</span>
          <h1 className="text-4xl font-black text-ink tracking-tight mt-1">{siteConfig.name}</h1>
          <p className="text-lg text-ink-muted mt-2">{siteConfig.tagline}</p>
        </div>

        <div className="prose prose-neutral max-w-none text-ink-muted space-y-4 text-sm leading-relaxed">
          <p>
            Bootcamp BD was built to bridge the gap between traditional Bangladeshi academia and the global technology demands of 2025 and beyond. While conventional bootcamps rely on obsolete slide decks, our platform empowers actual practitioners—engineers, product designers, and founders who build in production—to teach their craft.
          </p>
          <p>
            By combining the comprehensive curriculum structure of Udemy with the accountability, peer encouragement, and gamification of Skool communities, we make learning engaging, transparent, and direct.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
