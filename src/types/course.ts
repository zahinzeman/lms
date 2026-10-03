import { CourseLevel, CourseStatus, LessonType, PricingType, VideoProvider } from "./database";

export interface Course {
  id: string;
  creator_id: string;
  creator?: {
    id: string;
    handle: string;
    full_name: string;
    avatar_url: string | null;
    headline?: string | null;
  };
  title: string;
  slug: string;
  subtitle: string | null;
  description: any;
  description_text: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  level: CourseLevel;
  language: string;
  has_captions: boolean;
  thumbnail_url: string;
  promo_video_provider?: VideoProvider | null;
  promo_video_ref?: string | null;
  pricing_type: PricingType;
  price_minor: number;
  compare_at_price_minor: number | null;
  currency: "BDT" | "USD";
  outcomes: string[];
  requirements: string[];
  target_audience: string[];
  status: CourseStatus;
  review_note?: string | null;
  submitted_at?: string | null;
  published_at?: string | null;
  archived_at?: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  sections_count: number;
  lessons_count: number;
  total_duration_seconds: number;
  preview_lessons_count: number;
  enrolled_count: number;
  rating_avg: number;
  rating_count: number;
  drip_enabled: boolean;
  certificate_enabled: boolean;
  qa_enabled: boolean;
  sections?: CourseSection[];
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  position: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  section_id: string;
  title: string;
  type: LessonType;
  position: number;
  summary?: string | null;
  content?: any;
  video_provider?: VideoProvider | null;
  video_ref?: string | null;
  duration_seconds: number;
  is_preview: boolean;
  is_published: boolean;
  drip_days?: number | null;
  unlock_at?: string | null;
  resources?: LessonResource[];
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  kind: "file" | "link";
  file_path?: string | null;
  url?: string | null;
  size_bytes?: number | null;
  position: number;
}

export interface QuizQuestion {
  id: string;
  type: "single_choice" | "multiple_choice" | "true_false" | "short_answer";
  prompt: string;
  options: { id: string; text: string }[];
  explanation?: string;
  points: number;
  position: number;
}
