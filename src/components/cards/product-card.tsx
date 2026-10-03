"use client";

import Image from "next/image";
import Link from "next/link";
import { DigitalProduct } from "@/types/commerce";
import { Price } from "@/components/shared/price";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProps {
  product: DigitalProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const typeLabels: Record<string, string> = {
    ebook: "Ebook",
    template: "Template",
    preset: "Preset",
    toolkit: "Toolkit",
    bundle: "Bundle",
    audio: "Audio Pack",
    video_pack: "Video Pack",
    software: "Software",
    other: "Product",
  };

  return (
    <div className={`group flex flex-col cursor-pointer select-none ${className || ""}`}>
      <Link href={`/products/${product.slug}`} className="flex flex-col">
        {/* Cover 4:5 aspect ratio */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-2 mb-3">
          <Image
            src={product.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />

          <div className="absolute top-3 left-3">
            <Badge variant="neutral">
              {typeLabels[product.type] || "Digital"}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-title-md font-semibold text-ink line-clamp-2 leading-snug group-hover:underline">
            {product.title}
          </h3>

          <p className="text-body-sm text-muted line-clamp-1">
            {product.creator?.full_name || "Creator"}
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            <Rating rating={product.rating_avg} count={product.rating_count} />
          </div>

          <div className="mt-1">
            <Price
              priceMinor={product.price_minor}
              compareAtPriceMinor={product.compare_at_price_minor}
              currency={product.currency}
              size="md"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
