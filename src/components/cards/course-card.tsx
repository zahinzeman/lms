"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Course } from "@/types/course";
import { Price } from "@/components/shared/price";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

export interface CourseCardProps {
  course: Course;
  isWishlisted?: boolean;
  onToggleWishlist?: (courseId: string) => void;
  className?: string;
}

export function CourseCard({
  course,
  isWishlisted = false,
  onToggleWishlist,
  className,
}: CourseCardProps) {
  const [wishlisted, setWishlisted] = React.useState(isWishlisted);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
    onToggleWishlist?.(course.id);
  };

  const levelLabel = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    all_levels: "All Levels",
  }[course.level] || "All Levels";

  return (
    <div className={`group flex flex-col cursor-pointer select-none ${className || ""}`}>
      <Link href={`/courses/${course.slug}`} className="flex flex-col">
        {/* Photo Container - Airbnb Style */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-surface-2 mb-3">
          <Image
            src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80"}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />

          {/* Wishlist Heart button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                wishlisted
                  ? "fill-primary text-primary stroke-primary"
                  : "fill-black/30 text-white stroke-[2]"
              }`}
            />
          </button>

          {/* Badges on top left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            {course.is_bestseller && (
              <Badge variant="bestseller">Bestseller</Badge>
            )}
            {course.pricing_type === "free" && (
              <Badge variant="success">Free</Badge>
            )}
          </div>
        </div>

        {/* Metadata - Sits directly on the background without a border or card box */}
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-title-md font-semibold text-ink line-clamp-2 leading-snug group-hover:underline">
            {course.title}
          </h3>

          <p className="text-body-sm text-muted line-clamp-1">
            {course.creator?.full_name || "Instructor"}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-0.5">
            <Rating rating={course.rating_avg} count={course.rating_count} />
          </div>

          {/* Meta specs */}
          <div className="flex items-center gap-2 text-caption-sm text-muted mt-0.5">
            <span>{formatDuration(course.total_duration_seconds, "seconds")}</span>
            <span>•</span>
            <span>{levelLabel}</span>
          </div>

          {/* Price */}
          <div className="mt-1">
            <Price
              priceMinor={course.price_minor}
              compareAtPriceMinor={course.compare_at_price_minor}
              currency={course.currency}
              size="md"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
