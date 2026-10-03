import { Compass, MessageSquareCode, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Compass,
      title: "Discover Real-World Skills",
      desc: "Skip bloated academic theory. Choose battle-tested curriculums in full-stack dev, Figma systems, GenAI, and growth marketing.",
    },
    {
      step: "02",
      icon: MessageSquareCode,
      title: "Build Projects with Feedback",
      desc: "Complete actual client-grade milestones. Submit projects for personalized code and design roasts from verified instructors.",
    },
    {
      step: "03",
      icon: Trophy,
      title: "Level Up & Unlock Careers",
      desc: "Earn cryptographically verifiable certificates, climb community leaderboards, and get referred to top global remote employers.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface-1/60 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-4">
          How Bootcamp BD Works
        </h2>
        <p className="text-base text-ink-muted max-w-xl mx-auto mb-14">
          A modern learning loop designed for real retention, peer accountability, and high-income outcomes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative p-8 rounded-3xl bg-surface-1 text-left flex flex-col justify-between transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-black text-ink-muted/30">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">{s.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
