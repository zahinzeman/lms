import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-surface-1 text-ink py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-fg font-black text-sm">
                B
              </div>
              <span className="text-base font-extrabold tracking-tight text-ink">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-sm text-ink-muted max-w-sm mb-4 leading-relaxed">
              {siteConfig.tagline}. South Asia&apos;s most modern learning and creator ecosystem combining structured video masterclasses with Skool-style gamified communities.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted bg-surface-2 px-3 py-1.5 rounded-full w-fit">
              <Globe className="h-3.5 w-3.5 text-accent" />
              <span>Bangladesh (BDT ৳) &bull; English / Bengali</span>
            </div>
          </div>

          {/* Links 1: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-ink-muted">
              <li><Link href="/explore" className="hover:text-ink transition-colors">Course Catalog</Link></li>
              <li><Link href="/explore?type=products" className="hover:text-ink transition-colors">Digital Products</Link></li>
              <li><Link href="/communities" className="hover:text-ink transition-colors">Communities</Link></li>
              <li><Link href="/explore?category=cat-dev" className="hover:text-ink transition-colors">Web & Software</Link></li>
              <li><Link href="/explore?category=cat-design" className="hover:text-ink transition-colors">Design & Figma</Link></li>
            </ul>
          </div>

          {/* Links 2: Creators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
              Creators
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-ink-muted">
              <li><Link href="/teach" className="hover:text-ink transition-colors">Teach on {siteConfig.shortName}</Link></li>
              <li><Link href="/pricing" className="hover:text-ink transition-colors">Creator Plans & Fees</Link></li>
              <li><Link href="/become-creator" className="hover:text-ink transition-colors">Apply as Creator</Link></li>
              <li><Link href="/studio" className="hover:text-ink transition-colors">Creator Studio</Link></li>
              <li><Link href="/guidelines" className="hover:text-ink transition-colors">Quality Guidelines</Link></li>
            </ul>
          </div>

          {/* Links 3: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-ink-muted">
              <li><Link href="/about" className="hover:text-ink transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-ink transition-colors">Contact & Support</Link></li>
              <li><Link href="/legal/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/refund-policy" className="hover:text-ink transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-ink">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
