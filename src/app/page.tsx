import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/marketing/hero";
import { CategoryStrip } from "@/components/marketing/category-strip";
import { TrendingShelf } from "@/components/marketing/trending-shelf";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CommunitySpotlight } from "@/components/marketing/community-spotlight";
import { DigitalProductsShelf } from "@/components/marketing/digital-products-shelf";
import { OutcomesBand } from "@/components/marketing/outcomes-band";
import { BecomeCreatorBand } from "@/components/marketing/become-creator-band";
import { TopCreators } from "@/components/marketing/top-creators";
import { CreatorPlans } from "@/components/marketing/creator-plans";
import { FAQSection } from "@/components/marketing/faq-section";
import { FinalCTA } from "@/components/marketing/final-cta";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrendingCourses } from "@/lib/data/courses";
import { getCommunities } from "@/lib/data/communities";
import { getProducts } from "@/lib/data/products";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [courses, communities, products] = await Promise.all([
    getTrendingCourses(8),
    getCommunities({ limit: 3 }),
    getProducts({ limit: 6 }),
  ]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1">
        <Hero />
        <CategoryStrip />
        <TrendingShelf courses={courses} />
        <HowItWorks />
        <CommunitySpotlight communities={communities} />
        <DigitalProductsShelf products={products} />
        <OutcomesBand />
        <BecomeCreatorBand />
        <TopCreators />
        <CreatorPlans />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
