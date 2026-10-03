import { AppRole, CreatorStatus, LearningIntent } from "./database";

export interface Profile {
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
  socials: Record<string, string>;
  intent: LearningIntent;
  creator_status: CreatorStatus;
  onboarding_completed_at: string | null;
  is_suspended: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
  roles: AppRole[];
  isCreator: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

export interface CreatorApplication {
  id: string;
  user_id: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "needs_changes";
  niche: string;
  category_id: string;
  experience_summary: string;
  teaching_experience: string;
  portfolio_links: string[];
  sample_content_url?: string;
  planned_offerings: ("course" | "product" | "community" | "membership")[];
  audience_size: "0-1k" | "1k-10k" | "10k-100k" | "100k+";
  audience_channels: string[];
  why_teach: string;
  agrees_to_terms: boolean;
  reviewer_id?: string | null;
  review_note?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}
