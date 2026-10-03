import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrendingCourses } from "@/lib/data/courses";
import { CourseCard } from "@/components/cards/course-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Award, Zap, Trophy, ArrowRight, BookOpen } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const trendingCourses = await getTrendingCourses(4);
  const activeCourse = trendingCourses[0];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl bg-surface-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Level 4 Builder &bull; 1,420 XP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Welcome back, {user?.profile.full_name || "Learner"}!
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              You are on a 5-day learning streak. Complete today&apos;s milestone to reach Level 5!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-surface-2 text-center shrink-0">
              <span className="text-xs font-bold text-ink-muted uppercase">Streak</span>
              <p className="text-2xl font-black text-accent mt-0.5">5 Days</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-2 text-center shrink-0">
              <span className="text-xs font-bold text-ink-muted uppercase">Certificates</span>
              <p className="text-2xl font-black text-ink mt-0.5">2</p>
            </div>
          </div>
        </div>

        {/* Continue Learning Spotlight */}
        {activeCourse && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              <span>Jump Back In</span>
            </h2>

            <div className="p-6 rounded-3xl bg-surface-1 flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-5 w-full lg:w-auto">
                <div className="relative h-20 w-32 rounded-2xl overflow-hidden bg-surface-2 shrink-0">
                  <Image
                    src={activeCourse.thumbnail_url}
                    alt={activeCourse.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-bold text-accent uppercase">
                    Next Lesson: Section 2 &bull; Lesson 4
                  </span>
                  <h3 className="text-base font-bold text-ink truncate">
                    {activeCourse.title}
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36 h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full bg-accent w-2/3" />
                    </div>
                    <span className="text-xs font-semibold text-ink-muted">64% Done</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto shrink-0">
                <Link href={`/learn/${activeCourse.slug}/lesson-4`}>
                  <Button variant="primary" size="md" className="w-full lg:w-auto font-bold px-6">
                    <Play className="h-4 w-4 mr-2 fill-current" />
                    Resume Lesson
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recommended for You */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recommended for Your Goals</h2>
            <Link href="/explore" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              <span>View catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
