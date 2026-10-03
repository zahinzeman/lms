export interface Community {
  id: string;
  creator_id: string;
  creator?: {
    id: string;
    handle: string;
    full_name: string;
    avatar_url: string | null;
  };
  name: string;
  slug: string;
  tagline: string | null;
  description: any;
  cover_url: string;
  icon_url: string;
  tint: string;
  category_id: string | null;
  visibility: "public" | "private";
  is_listed: boolean;
  access_type: "free" | "paid" | "plan" | "invite";
  price_monthly_minor?: number | null; // e.g. 99000 = ৳990
  currency?: "BDT" | "USD";
  member_count: number;
  online_count: number;
  posts_count: number;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  author: {
    name: string;
    handle: string;
    avatar_url: string | null;
    level: number;
  };
  category_name: string;
  title: string;
  body_text: string;
  attachments?: any[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_liked?: boolean;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  location_type: "online" | "in_person";
  meeting_url?: string;
  rsvps_count: number;
}
