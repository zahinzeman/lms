import { MOCK_COURSES } from "@/lib/mock/courses";
import { Course, Lesson } from "@/types/course";

export async function getEnrolledCourses(): Promise<Course[]> {
  // Return the first 3 courses as default active enrollments for demo
  return MOCK_COURSES.slice(0, 3);
}

export async function getLessonWithCourse(courseSlug: string, lessonId: string) {
  const course = MOCK_COURSES.find((c) => c.slug === courseSlug);
  if (!course) return null;

  let foundLesson: Lesson | null = null;
  if (course.sections) {
    for (const section of course.sections) {
      const l = section.lessons.find((item) => item.id === lessonId);
      if (l) {
        foundLesson = l;
        break;
      }
    }
  }

  // Fallback to first lesson if not found
  if (!foundLesson && course.sections && course.sections[0]?.lessons[0]) {
    foundLesson = course.sections[0].lessons[0];
  }

  return {
    course,
    lesson: foundLesson,
  };
}
