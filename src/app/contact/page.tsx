import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { Mail, MessageSquare } from "lucide-react";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Contact</span>
          <h1 className="text-3xl font-black text-ink tracking-tight mt-1">Get in Touch</h1>
          <p className="text-sm text-ink-muted mt-1">
            Questions about our platform, payments, or creator partnerships? Drop us a message.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-surface-1 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Your Name
              </label>
              <Input placeholder="Your full name" className="bg-surface-2 h-11" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Email Address
              </label>
              <Input type="email" placeholder="you@domain.com" className="bg-surface-2 h-11" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Message
              </label>
              <Textarea placeholder="How can we help you?" className="bg-surface-2 min-h-[120px]" />
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full font-bold h-11">
            Send Message
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-ink-muted">
              Or email our support team directly at{" "}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-accent font-bold underline">
                {siteConfig.supportEmail}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
