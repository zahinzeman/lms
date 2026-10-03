import { createClient } from "@/lib/supabase/server";
import { Community, CommunityPost } from "@/types/community";
import { MOCK_COMMUNITIES, MOCK_POSTS } from "@/lib/mock/communities";

export async function getCommunities(options: { category?: string; search?: string; limit?: number } = {}): Promise<Community[]> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      let query = supabase
        .from("communities")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url)")
        .eq("status", "published");

      if (options.category) query = query.eq("category_id", options.category);
      if (options.search) query = query.ilike("name", `%${options.search}%`);
      if (options.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as Community[];
      }
    }
  } catch (err) {
    console.warn("DB communities query failed, using mock:", err);
  }

  let result = [...MOCK_COMMUNITIES];
  if (options.category) result = result.filter((c) => c.category_id === options.category);
  if (options.search) {
    const s = options.search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(s) || c.tagline?.toLowerCase().includes(s));
  }
  if (options.limit) result = result.slice(0, options.limit);
  return result;
}

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("communities")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url)")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) return data as unknown as Community;
    }
  } catch (err) {
    console.warn("DB community by slug failed:", err);
  }

  return MOCK_COMMUNITIES.find((c) => c.slug === slug) || null;
}

export async function getCommunityPosts(communityId: string): Promise<CommunityPost[]> {
  return MOCK_POSTS.filter((p) => p.community_id === communityId);
}
