import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { getEnrolledCourses } from "@/lib/data/learning";
import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";

export default async function MyLearningPage() {
  const enrolledCourses = await getEnrolledCourses();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Pick up right where you left off. All videos, code files, and quizzes included.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((c, idx) => {
            const progressPct = idx === 0 ? 68 : idx === 1 ? 34 : 12;
            const firstLessonId = c.sections?.[0]?.lessons?.[0]?.id || "intro";

            return (
              <div key={c.id} className="rounded-3xl bg-surface-1 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video w-full bg-surface-2">
                    <Image
                      src={c.thumbnail_url}
                      alt={c.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-ink line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-ink-muted">{c.creator?.full_name || "Instructor"}</p>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold text-ink-muted">
                        <span>Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link href={`/learn/${c.slug}/${firstLessonId}`} className="block">
                    <Button variant="primary" size="md" className="w-full font-bold">
                      <Play className="h-4 w-4 mr-2 fill-current" />
                      Continue Course
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
