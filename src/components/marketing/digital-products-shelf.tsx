import Link from "next/link";
import { DigitalProduct } from "@/types/commerce";
import { ProductCard } from "@/components/cards/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ArrowRight, Boxes } from "lucide-react";

interface DigitalProductsShelfProps {
  products: DigitalProduct[];
}

export function DigitalProductsShelf({ products }: DigitalProductsShelfProps) {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold mb-2">
            <Boxes className="h-3.5 w-3.5" />
            <span>Instant Download Toolkits</span>
          </div>
          <SectionHeader
            title="Digital Assets & Templates"
            description="Production starter kits, Figma systems, LUTs, and prompt playbooks to supercharge your workflow."
          />
        </div>
        <Link
          href="/explore?type=products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
        >
          <span>Explore all products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
