import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getTrendingCourses } from "@/lib/data/courses";
import { CourseCard } from "@/components/cards/course-card";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const wishlistCourses = (await getTrendingCourses(4)).slice(1, 3);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent fill-current" />
            <span>My Wishlist ({wishlistCourses.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Courses and digital assets you have bookmarked to learn next.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
