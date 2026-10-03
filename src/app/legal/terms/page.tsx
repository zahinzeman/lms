import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="text-3xl font-black text-ink">Terms of Service</h1>
        <p className="text-xs text-ink-muted">Last revised: January 1, 2025</p>

        <div className="prose prose-neutral max-w-none text-ink-muted space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to Bootcamp BD. By accessing or using our websites, services, applications, and creator tools, you agree to be bound by these Terms of Service.
          </p>
          <h2 className="text-base font-bold text-ink">1. Platform Accounts</h2>
          <p>
            You must provide accurate, complete information when creating an account. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          <h2 className="text-base font-bold text-ink">2. Creator Rights and Obligations</h2>
          <p>
            Creators retain full copyright ownership of courses, digital products, and community posts they publish. By publishing content, you grant Bootcamp BD a worldwide license to host, stream, and display the content to enrolled students.
          </p>
          <h2 className="text-base font-bold text-ink">3. Payments and Payouts</h2>
          <p>
            All consumer transactions are charged in BDT or USD as listed. Creator payouts are disbursed bi-weekly via Bangladeshi bank transfer or bKash merchant payout subject to platform tier fee deductions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
