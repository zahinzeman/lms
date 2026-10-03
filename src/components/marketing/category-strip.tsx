"use client";

import Link from "next/link";
import { categories } from "@/config/categories";
import {
  Code2, Palette, Briefcase, Megaphone, Sparkles, Laptop, Video, Flame,
  Languages, TrendingUp, Music, Activity, LucideIcon
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Code2, Palette, Briefcase, Megaphone, Sparkles, Laptop, Video, Flame,
  Languages, TrendingUp, Music, Activity
};

export function CategoryStrip() {
  return (
    <section className="py-8 bg-surface-1/50 overflow-x-auto no-scrollbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const Icon = ICONS[cat.icon] || Code2;
            return (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.id}`}
                className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface-1 hover:bg-surface-2 transition-all hover:scale-[1.02] text-sm font-semibold text-ink"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-surface-2 text-ink">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
