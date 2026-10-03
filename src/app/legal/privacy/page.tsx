import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="text-3xl font-black text-ink">Privacy Policy</h1>
        <p className="text-xs text-ink-muted">Last revised: January 1, 2025</p>

        <div className="prose prose-neutral max-w-none text-ink-muted space-y-4 text-sm leading-relaxed">
          <p>
            Your privacy is foundational to our platform. This Privacy Policy describes how Bootcamp BD collects, uses, and protects your personal information.
          </p>
          <h2 className="text-base font-bold text-ink">1. Information We Collect</h2>
          <p>
            We collect account registration information (name, email, profile headline), payment metadata processed through certified gateways (bKash, SSLCommerz, Stripe), and learning progress statistics.
          </p>
          <h2 className="text-base font-bold text-ink">2. How We Protect Your Data</h2>
          <p>
            All network communication is encrypted using TLS 1.3. Passwords and credentials are never stored in plain text and are secured using Supabase Auth cryptographic hashing.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
