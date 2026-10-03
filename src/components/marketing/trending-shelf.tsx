import Link from "next/link";
import { Course } from "@/types/course";
import { CourseCard } from "@/components/cards/course-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ArrowRight } from "lucide-react";

interface TrendingShelfProps {
  courses: Course[];
}

export function TrendingShelf({ courses }: TrendingShelfProps) {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <SectionHeader
          title="Trending Masterclasses"
          description="High-velocity skills taught by verified practitioners who ship in production."
        />
        <Link
          href="/explore"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
        >
          <span>Explore all courses</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.slice(0, 8).map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
        >
          <span>Explore all courses</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
