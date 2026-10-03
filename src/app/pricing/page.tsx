import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { CreatorPlans } from "@/components/marketing/creator-plans";
import { FAQSection } from "@/components/marketing/faq-section";

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1">
        <CreatorPlans />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
