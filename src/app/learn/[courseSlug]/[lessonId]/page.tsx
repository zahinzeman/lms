import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonWithCourse } from "@/lib/data/learning";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Play, FileDown, MessageSquare, BookOpen, ChevronRight } from "lucide-react";

interface LearnPageProps {
  params: Promise<{
    courseSlug: string;
    lessonId: string;
  }>;
}

export default async function LearnFocusPage({ params }: LearnPageProps) {
  const { courseSlug, lessonId } = await params;
  const data = await getLessonWithCourse(courseSlug, lessonId);

  if (!data || !data.course) {
    notFound();
  }

  const { course, lesson } = data;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Focus Header */}
      <header className="h-14 bg-surface-1 flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Course</span>
          </Link>
          <div className="h-4 w-px bg-surface-3" />
          <span className="text-xs sm:text-sm font-bold text-ink truncate max-w-xs sm:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="primary" className="font-bold text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Mark Complete & Next
          </Button>
        </div>
      </header>

      {/* Main Focus Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center / Video player area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Container (16:9) */}
          <div className="w-full bg-black aspect-video max-h-[65vh] flex items-center justify-center relative">
            {lesson?.video_ref ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${lesson.video_ref}?autoplay=0&rel=0`}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="h-16 w-16 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto">
                  <Play className="h-8 w-8 fill-current ml-1" />
                </div>
                <p className="text-white font-bold text-base">{lesson?.title || "Lesson Video"}</p>
                <p className="text-white/60 text-xs">Click play to begin lesson</p>
              </div>
            )}
          </div>

          {/* Lesson Info & Tabs */}
          <div className="p-6 sm:p-8 max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-ink">{lesson?.title || "Course Lesson"}</h1>
              <p className="text-xs text-ink-muted mt-1">{lesson?.summary || "Watch the video and complete the exercises."}</p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-1 space-y-3">
              <h2 className="text-base font-bold text-ink">Lesson Notes & Resources</h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                Download the accompanying source code and starter repository for this lesson. If you encounter any bugs, post in the community Q&A section.
              </p>
              <div className="pt-2">
                <Button variant="secondary" size="sm" className="font-bold">
                  <FileDown className="h-4 w-4 mr-1.5" />
                  Download starter-code.zip
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Curriculum Sidebar */}
        <div className="w-full lg:w-80 lg:shrink-0 bg-surface-1 overflow-y-auto p-4 space-y-4">
          <h2 className="text-sm font-bold text-ink px-2">Course Curriculum</h2>

          <div className="space-y-3">
            {course.sections?.map((section, sIdx) => (
              <div key={section.id} className="rounded-2xl bg-surface-2 p-3 space-y-2">
                <p className="text-xs font-bold text-ink">
                  Section {sIdx + 1}: {section.title}
                </p>

                <div className="space-y-1">
                  {section.lessons.map((l) => {
                    const isActive = l.id === lesson?.id;
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/${course.slug}/${l.id}`}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-accent text-accent-fg font-bold"
                            : "text-ink-muted hover:text-ink hover:bg-surface-3"
                        }`}
                      >
                        <span className="truncate pr-2">{l.title}</span>
                        <Play className={`h-3 w-3 shrink-0 ${isActive ? "fill-current" : ""}`} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
