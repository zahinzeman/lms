"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-surface-2 hover:bg-surface-3 text-ink disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "h-9 min-w-9 px-3 flex items-center justify-center rounded-full text-body-sm font-semibold transition-colors cursor-pointer",
              isCurrent
                ? "bg-ink text-white"
                : "bg-surface-2 hover:bg-surface-3 text-ink"
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-surface-2 hover:bg-surface-3 text-ink disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
