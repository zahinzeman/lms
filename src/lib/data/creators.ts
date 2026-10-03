import { createClient } from "@/lib/supabase/server";
import { MOCK_CREATORS } from "@/lib/mock/creators";

export async function getTopCreators(limit = 6) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("creator_status", "approved")
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("DB creators query failed, using mock:", err);
  }

  return MOCK_CREATORS.slice(0, limit);
}

export async function getCreatorByHandle(handle: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("handle", handle)
        .maybeSingle();

      if (!error && data) return data;
    }
  } catch (err) {
    console.warn("DB creator by handle failed:", err);
  }

  return MOCK_CREATORS.find((c) => c.handle === handle) || null;
}
