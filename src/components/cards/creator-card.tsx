import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface Creator {
  id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  niche: string;
  students_count: number;
  courses_count: number;
  rating_avg: number;
  bio?: string;
}

export function CreatorCard({
  creator,
  className,
}: {
  creator: Creator;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center text-center p-6 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors ${className || ""}`}
    >
      <Avatar
        size={96}
        src={creator.avatar_url}
        alt={creator.name}
        fallback={creator.name}
        className="mb-4"
      />

      <h3 className="text-display-sm text-ink font-bold leading-tight">
        {creator.name}
      </h3>

      <p className="text-body-sm text-primary font-semibold mt-1 mb-2">
        {creator.niche}
      </p>

      <div className="flex items-center gap-4 text-caption-sm text-muted mb-5">
        <span>{creator.students_count.toLocaleString()} students</span>
        <span>•</span>
        <span>{creator.courses_count} courses</span>
      </div>

      <Button asChild variant="secondary" size="sm" shape="pill" className="w-full bg-canvas hover:bg-surface-1">
        <Link href={`/creators/${creator.handle}`}>View storefront</Link>
      </Button>
    </div>
  );
}
