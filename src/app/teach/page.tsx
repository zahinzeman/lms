import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { BecomeCreatorBand } from "@/components/marketing/become-creator-band";
import { CreatorPlans } from "@/components/marketing/creator-plans";
import { ArrowRight, CheckCircle2, Shield, Video, Users2, DollarSign } from "lucide-react";

export default async function TeachPage() {
  const user = await getCurrentUser();

  const benefits = [
    {
      icon: DollarSign,
      title: "Keep 85% to 100% of Revenue",
      desc: "Lowest platform fee in South Asia. No hidden video storage, streaming, or bandwidth markups.",
    },
    {
      icon: Users2,
      title: "Own Your Audience & Community",
      desc: "Direct communication with your students. Built-in Skool-style community gamification and leaderboard.",
    },
    {
      icon: Video,
      title: "World-Class Video Infrastructure",
      desc: "Adaptive bitrate streaming, DRM protection, lesson notes, and interactive quizzes out of the box.",
    },
    {
      icon: Shield,
      title: "Bi-Weekly Local Payouts",
      desc: "Automated settlements directly to your Bangladeshi bank account or bKash merchant wallet.",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-surface-1 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
            Teach on Bootcamp BD
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-tight">
            Turn your professional knowledge into a recurring business.
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed">
            Join 340+ leading engineers, product designers, and founders teaching the next generation of builders in Bangladesh.
          </p>
          <div className="pt-2">
            <Link href="/become-creator">
              <Button size="lg" variant="primary" className="h-12 px-8 font-bold text-base">
                <span>Apply to Teach</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="p-6 rounded-3xl bg-surface-1 space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-ink">{b.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <BecomeCreatorBand />
      <CreatorPlans />

      <Footer />
    </div>
  );
}
