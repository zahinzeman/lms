import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { getProductBySlug } from "@/lib/data/products";
import { formatBDT } from "@/lib/utils/format-currency";
import { Rating } from "@/components/shared/rating";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Check, Download, FileText, ShieldCheck, Sparkles, FolderDown } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Cover / Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-surface-2">
              <Image
                src={product.cover_url}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Description */}
            <div className="p-8 rounded-3xl bg-surface-1 space-y-4">
              <h2 className="text-xl font-bold text-ink">About this digital asset</h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                {product.description_text}
              </p>
              {product.license_text && (
                <div className="pt-2 text-xs text-ink-muted">
                  <span className="font-bold text-ink">License: </span>
                  {product.license_text}
                </div>
              )}
            </div>
          </div>

          {/* Right Buy / Download Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-surface-2 space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                  {product.type}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                  {product.title}
                </h1>
                <p className="text-xs text-ink-muted mt-1">{product.subtitle}</p>
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-1">
                <Avatar
                  src={product.creator?.avatar_url || undefined}
                  fallback={product.creator?.full_name || "Creator"}
                  size={40}
                />
                <div>
                  <p className="text-xs text-ink-muted">Created by</p>
                  <p className="text-sm font-bold text-ink">{product.creator?.full_name || "Author"}</p>
                </div>
              </div>

              {/* Rating & Sales */}
              <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <Rating rating={product.rating_avg} size="sm" />
                  <span>({product.rating_count} reviews)</span>
                </div>
                <span>{product.sales_count.toLocaleString()} copies downloaded</span>
              </div>

              {/* Price */}
              <div className="pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-ink">
                    {formatBDT(product.price_minor)}
                  </span>
                  {product.compare_at_price_minor && (
                    <span className="text-sm text-ink-muted line-through">
                      {formatBDT(product.compare_at_price_minor)}
                    </span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Link href="/library" className="block">
                  <Button size="lg" variant="primary" className="w-full font-bold h-12">
                    <Download className="h-4 w-4 mr-2" />
                    Buy & Instant Download
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button size="lg" variant="secondary" className="w-full font-bold h-11">
                    Add to Cart
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="space-y-2 pt-2 text-xs text-ink-muted">
                <div className="flex items-center gap-2">
                  <FolderDown className="h-4 w-4 text-accent" />
                  <span>{product.file_count} files included ({product.version || "Latest version"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Lifetime updates & future releases</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
