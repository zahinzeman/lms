import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourseBySlug } from "@/lib/data/courses";
import { formatBDT } from "@/lib/utils/format-currency";
import { formatDuration } from "@/lib/utils/format-duration";
import { Rating } from "@/components/shared/rating";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Check, Play, Clock, Award, ShieldCheck, Globe, BookOpen, Users } from "lucide-react";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const firstLessonId = course.sections?.[0]?.lessons?.[0]?.id || "intro";

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />

      {/* Header Banner */}
      <div className="bg-surface-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
              <span>Course</span>
              <span>&bull;</span>
              <span className="capitalize">{course.level} Level</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
              {course.subtitle || course.description_text}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-muted pt-1">
              <div className="flex items-center gap-1.5">
                <Rating rating={course.rating_avg} size="sm" />
                <span className="text-ink font-bold">({course.rating_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent" />
                <span>{course.enrolled_count.toLocaleString()} students enrolled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>{course.language}</span>
              </div>
            </div>

            {/* Creator line */}
            <div className="flex items-center gap-3 pt-2">
              <Avatar
                src={course.creator?.avatar_url || undefined}
                fallback={course.creator?.full_name || "Instructor"}
                size={40}
              />
              <div>
                <p className="text-xs text-ink-muted">Created by</p>
                <p className="text-sm font-bold text-ink">{course.creator?.full_name || "Lead Instructor"}</p>
              </div>
            </div>
          </div>

          {/* Sticky Purchase Card (Desktop) */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-surface-2 p-6 space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-3 group cursor-pointer">
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-accent text-accent-fg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-ink">
                    {course.pricing_type === "free" ? "Free" : formatBDT(course.price_minor)}
                  </span>
                  {course.compare_at_price_minor && (
                    <span className="text-sm text-ink-muted line-through">
                      {formatBDT(course.compare_at_price_minor)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Link href={`/learn/${course.slug}/${firstLessonId}`} className="block">
                  <Button size="lg" variant="primary" className="w-full font-bold h-12">
                    {course.pricing_type === "free" ? "Start Free Course" : "Enroll Now"}
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button size="lg" variant="secondary" className="w-full font-bold h-11">
                    Add to Cart
                  </Button>
                </Link>
              </div>

              {/* Guarantee */}
              <div className="space-y-2 pt-2 text-xs font-medium text-ink-muted">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <span>{formatDuration(course.total_duration_seconds)} on-demand video</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent shrink-0" />
                  <span>Certificate of completion included</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                  <span>30-day money-back satisfaction guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            {/* Outcomes */}
            <div className="p-8 rounded-3xl bg-surface-1 space-y-4">
              <h2 className="text-xl font-bold text-ink">What you will learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm font-medium text-ink">
                    <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-ink">Course Content</h2>
                <span className="text-xs text-ink-muted font-bold">
                  {course.sections_count} sections &bull; {course.lessons_count} lessons &bull; {formatDuration(course.total_duration_seconds)}
                </span>
              </div>

              <div className="space-y-3">
                {course.sections?.map((section, sIdx) => (
                  <div key={section.id} className="rounded-2xl bg-surface-1 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-ink">
                        Section {sIdx + 1}: {section.title}
                      </h3>
                      <span className="text-xs text-ink-muted">
                        {section.lessons.length} lessons
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 text-ink">
                            <Play className="h-3.5 w-3.5 text-accent" />
                            <span>{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-ink-muted">
                            {lesson.is_preview && (
                              <span className="text-accent font-bold">Preview</span>
                            )}
                            <span>{formatDuration(lesson.duration_seconds)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-ink">Requirements</h2>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-ink-muted">
                {course.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
