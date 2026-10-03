export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "student" | "creator" | "moderator" | "admin";
export type CreatorStatus = "none" | "pending" | "approved" | "rejected" | "suspended";
export type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "needs_changes";
export type LearningIntent = "learn" | "teach" | "both";
export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";
export type CourseStatus = "draft" | "in_review" | "changes_requested" | "published" | "unlisted" | "archived" | "rejected";
export type PricingType = "free" | "paid" | "subscription_only";
export type LessonType = "video" | "article" | "quiz" | "assignment" | "live" | "download" | "embed";
export type VideoProvider = "upload" | "youtube" | "vimeo" | "bunny" | "mux";
export type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "short_answer";
export type ProductType = "ebook" | "template" | "preset" | "audio" | "video_pack" | "software" | "toolkit" | "bundle" | "other";
export type ItemType = "course" | "product" | "plan";
export type OrderStatus = "pending" | "awaiting_payment" | "paid" | "failed" | "canceled" | "refunded" | "partially_refunded";
export type PaymentProvider = "stripe" | "sslcommerz" | "free" | "manual";
export type EnrollmentSource = "purchase" | "free" | "subscription" | "coupon_full" | "admin_grant" | "bundle";
export type AccessStatus = "active" | "revoked" | "expired";
export type PlanScope = "creator_all_access" | "creator_selected" | "community" | "platform_creator";
export type BillingInterval = "month" | "year" | "one_time";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired" | "incomplete";
export type DiscountType = "percent" | "fixed";
export type EarningStatus = "pending" | "available" | "paid_out" | "reversed";
export type PayoutStatus = "requested" | "approved" | "processing" | "paid" | "rejected";
export type RefundStatus = "requested" | "approved" | "rejected" | "processed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          handle: string;
          full_name: string | null;
          avatar_url: string | null;
          headline: string | null;
          bio: string | null;
          country: string;
          timezone: string;
          locale: string;
          preferred_currency: "BDT" | "USD";
          website: string | null;
          socials: Json;
          intent: LearningIntent;
          creator_status: CreatorStatus;
          onboarding_completed_at: string | null;
          is_suspended: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          handle: string;
          full_name?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          bio?: string | null;
          country?: string;
          timezone?: string;
          locale?: string;
          preferred_currency?: "BDT" | "USD";
          website?: string | null;
          socials?: Json;
          intent?: LearningIntent;
          creator_status?: CreatorStatus;
          onboarding_completed_at?: string | null;
          is_suspended?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role: AppRole;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: AppRole;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          icon: string;
          tint: string;
          description: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          icon: string;
          tint: string;
          description?: string | null;
          position?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      courses: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          description: Json | null;
          description_text: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          level: CourseLevel;
          language: string;
          has_captions: boolean;
          thumbnail_url: string | null;
          promo_video_provider: VideoProvider | null;
          promo_video_ref: string | null;
          pricing_type: PricingType;
          price_minor: number;
          compare_at_price_minor: number | null;
          currency: "BDT" | "USD";
          outcomes: string[];
          requirements: string[];
          target_audience: string[];
          status: CourseStatus;
          review_note: string | null;
          submitted_at: string | null;
          published_at: string | null;
          archived_at: string | null;
          is_featured: boolean;
          is_bestseller: boolean;
          sections_count: number;
          lessons_count: number;
          total_duration_seconds: number;
          preview_lessons_count: number;
          enrolled_count: number;
          rating_avg: number | null;
          rating_count: number;
          drip_enabled: boolean;
          certificate_enabled: boolean;
          qa_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["courses"]["Row"]> & {
          id?: string;
          creator_id: string;
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
      };
      course_sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          position: number;
        };
        Update: Partial<Database["public"]["Tables"]["course_sections"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          section_id: string;
          title: string;
          type: LessonType;
          position: number;
          summary: string | null;
          content: Json | null;
          video_provider: VideoProvider | null;
          video_ref: string | null;
          duration_seconds: number;
          is_preview: boolean;
          is_published: boolean;
          drip_days: number | null;
          unlock_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lessons"]["Row"]> & {
          id?: string;
          course_id: string;
          section_id: string;
          title: string;
          type: LessonType;
          position: number;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          type: ProductType;
          description: Json | null;
          description_text: string | null;
          category_id: string | null;
          cover_url: string | null;
          gallery: string[];
          price_minor: number;
          compare_at_price_minor: number | null;
          currency: "BDT" | "USD";
          pay_what_you_want: boolean;
          min_price_minor: number | null;
          status: CourseStatus;
          license_text: string | null;
          version: string | null;
          file_count: number;
          sales_count: number;
          rating_avg: number | null;
          rating_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          creator_id: string;
          title: string;
          slug: string;
          type: ProductType;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: OrderStatus;
          currency: "BDT" | "USD";
          subtotal_minor: number;
          discount_minor: number;
          tax_minor: number;
          total_minor: number;
          coupon_id: string | null;
          provider: PaymentProvider;
          provider_session_id: string | null;
          provider_payment_id: string | null;
          paid_at: string | null;
          billing_name: string | null;
          billing_email: string | null;
          billing_country: string | null;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          user_id: string;
          order_number: string;
          total_minor: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      communities: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          slug: string;
          tagline: string | null;
          description: Json | null;
          cover_url: string | null;
          icon_url: string | null;
          tint: string;
          category_id: string | null;
          visibility: "public" | "private";
          is_listed: boolean;
          access_type: "free" | "paid" | "plan" | "invite";
          plan_id: string | null;
          join_questions: Json;
          requires_approval: boolean;
          rules: Json;
          level_names: string[];
          level_thresholds: number[];
          member_count: number;
          online_count: number;
          posts_count: number;
          status: "draft" | "published" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["communities"]["Row"]> & {
          creator_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["communities"]["Insert"]>;
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          handle: string;
          full_name: string | null;
          avatar_url: string | null;
          headline: string | null;
          bio: string | null;
          country: string;
          socials: Json;
          creator_status: CreatorStatus;
        };
      };
    };
    Functions: {
      has_role: {
        Args: { _role: AppRole };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_creator: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      has_course_access: {
        Args: { _user: string; _course: string };
        Returns: boolean;
      };
      compute_cart: {
        Args: { _user: string; _coupon_code?: string; _currency?: string };
        Returns: Json;
      };
    };
  };
}
