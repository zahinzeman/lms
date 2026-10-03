"use client";

import Image from "next/image";
import Link from "next/link";
import { Community } from "@/types/community";
import { formatCurrency } from "@/lib/utils";

export interface CommunityCardProps {
  community: Community;
  className?: string;
}

export function CommunityCard({ community, className }: CommunityCardProps) {
  const isFree = community.access_type === "free" || !community.price_monthly_minor;
  const priceDisplay = isFree
    ? "Free"
    : `${formatCurrency(community.price_monthly_minor || 0, community.currency || "BDT")}/mo`;

  return (
    <div className={`group flex flex-col cursor-pointer select-none ${className || ""}`}>
      <Link href={`/c/${community.slug}/about`} className="flex flex-col">
        {/* Cover with Avatar Icon Overlay */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-surface-2 mb-4">
          <Image
            src={community.cover_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=640&q=80"}
            alt={community.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />

          {/* Overlaid community icon */}
          <div className="absolute -bottom-3 left-4 h-12 w-12 rounded-full overflow-hidden bg-canvas ring-4 ring-canvas shrink-0">
            <Image
              src={community.icon_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"}
              alt={community.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 pt-1 text-left">
          <h3 className="text-display-sm font-bold text-ink group-hover:underline">
            {community.name}
          </h3>

          <p className="text-body-sm text-muted line-clamp-2 leading-relaxed">
            {community.tagline || "Learn, collaborate, and grow with ambitious peers."}
          </p>

          <div className="flex items-center justify-between text-caption-sm text-muted mt-2 pt-2 border-0">
            <div className="flex items-center gap-3">
              <span>{community.member_count.toLocaleString()} members</span>
              <span className="flex items-center gap-1.5 text-success font-medium">
                <span className="h-2 w-2 rounded-full bg-success inline-block animate-pulse" />
                {community.online_count} online
              </span>
            </div>

            <span className="text-title-md font-bold text-ink">
              {priceDisplay}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
