"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchPillProps {
  className?: string;
  defaultQuery?: string;
  defaultType?: string;
  compact?: boolean;
  placeholder?: string;
}

export function SearchPill({
  className,
  defaultQuery = "",
  defaultType = "courses",
  compact = false,
  placeholder,
}: SearchPillProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultQuery);
  const [type, setType] = React.useState(defaultType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push(`/explore?type=${type}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${type}`);
    }
  };

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center bg-surface-2 hover:bg-surface-3 transition-colors rounded-full h-11 px-4 gap-2.5 max-w-sm w-full select-none",
          "focus-within:bg-canvas focus-within:outline-2 focus-within:outline-ink focus-within:outline-offset-2",
          className
        )}
      >
        <Search className="h-4 w-4 text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search courses, skills, creators..."}
          className="bg-transparent text-body-sm text-ink placeholder:text-muted w-full focus:outline-none"
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center bg-surface-2 rounded-full h-16 p-2 max-w-2xl w-full transition-colors",
        "focus-within:bg-canvas focus-within:outline-2 focus-within:outline-ink focus-within:outline-offset-2",
        className
      )}
    >
      {/* Segment 1: Query */}
      <div className="flex-1 flex flex-col justify-center px-5 h-full rounded-full hover:bg-surface-3/60 transition-colors">
        <label className="text-micro text-muted font-bold tracking-wider">
          WHAT DO YOU WANT TO LEARN?
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search Python, Figma, Upwork..."}
          className="bg-transparent text-title-md text-ink placeholder:text-muted-soft focus:outline-none w-full"
        />
      </div>

      {/* Segment 2: Type select */}
      <div className="hidden sm:flex flex-col justify-center px-5 h-full rounded-full hover:bg-surface-3/60 transition-colors shrink-0">
        <label className="text-micro text-muted font-bold tracking-wider">
          TYPE
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-transparent text-body-sm text-ink font-semibold focus:outline-none cursor-pointer pr-4"
        >
          <option value="courses">Courses</option>
          <option value="products">Digital Products</option>
          <option value="communities">Communities</option>
        </select>
      </div>

      {/* Rausch 48px Search Orb */}
      <button
        type="submit"
        aria-label="Search"
        className="h-12 w-12 rounded-full bg-primary hover:bg-primary-active active:bg-primary-active text-on-primary flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
      >
        <Search className="h-5 w-5 stroke-[2.2]" />
      </button>
    </form>
  );
}
