import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RefundPolicyPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="text-3xl font-black text-ink">Refund Policy</h1>
        <p className="text-xs text-ink-muted">Last revised: January 1, 2025</p>

        <div className="prose prose-neutral max-w-none text-ink-muted space-y-4 text-sm leading-relaxed">
          <p>
            We want you to be completely satisfied with your learning experience on Bootcamp BD.
          </p>
          <h2 className="text-base font-bold text-ink">1. 30-Day Course Guarantee</h2>
          <p>
            If you are unsatisfied with a course you purchased, you may request a full refund within 30 days of purchase provided you have not completed more than 30% of the course curriculum or claimed a certificate.
          </p>
          <h2 className="text-base font-bold text-ink">2. Digital Products and Downloads</h2>
          <p>
            Because digital asset downloads (Figma files, starter kits, source code) are immediately accessible upon purchase, refunds for digital downloads are evaluated on a case-by-case basis if files are proven defective.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
