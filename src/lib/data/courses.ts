import { createClient } from "@/lib/supabase/server";
import { Course } from "@/types/course";
import { MOCK_COURSES } from "@/lib/mock/courses";

interface GetCoursesOptions {
  category?: string;
  level?: string;
  search?: string;
  pricing?: string;
  sort?: "trending" | "newest" | "highest_rated" | "price_asc" | "price_desc";
  limit?: number;
}

export async function getCourses(options: GetCoursesOptions = {}): Promise<Course[]> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      let query = supabase
        .from("courses")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url, headline)")
        .eq("status", "published");

      if (options.category) {
        query = query.eq("category_id", options.category);
      }
      if (options.level && options.level !== "all") {
        query = query.eq("level", options.level);
      }
      if (options.pricing === "free") {
        query = query.eq("pricing_type", "free");
      } else if (options.pricing === "paid") {
        query = query.eq("pricing_type", "paid");
      }
      if (options.search) {
        query = query.ilike("title", `%${options.search}%`);
      }

      if (options.sort === "newest") {
        query = query.order("published_at", { ascending: false });
      } else if (options.sort === "highest_rated") {
        query = query.order("rating_avg", { ascending: false });
      } else if (options.sort === "price_asc") {
        query = query.order("price_minor", { ascending: true });
      } else if (options.sort === "price_desc") {
        query = query.order("price_minor", { ascending: false });
      } else {
        // default trending
        query = query.order("enrolled_count", { ascending: false });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as Course[];
      }
    }
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && (err as any).digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.warn("Falling back to mock courses due to DB query failure:", err);
  }

  // Graceful fallback to mock data
  let result = [...MOCK_COURSES];

  if (options.category) {
    result = result.filter((c) => c.category_id === options.category);
  }
  if (options.level && options.level !== "all") {
    result = result.filter((c) => c.level === options.level);
  }
  if (options.pricing === "free") {
    result = result.filter((c) => c.pricing_type === "free");
  } else if (options.pricing === "paid") {
    result = result.filter((c) => c.pricing_type === "paid");
  }
  if (options.search) {
    const s = options.search.toLowerCase();
    result = result.filter((c) => c.title.toLowerCase().includes(s) || c.subtitle?.toLowerCase().includes(s));
  }

  if (options.sort === "newest") {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (options.sort === "highest_rated") {
    result.sort((a, b) => b.rating_avg - a.rating_avg);
  } else if (options.sort === "price_asc") {
    result.sort((a, b) => a.price_minor - b.price_minor);
  } else if (options.sort === "price_desc") {
    result.sort((a, b) => b.price_minor - a.price_minor);
  } else {
    result.sort((a, b) => b.enrolled_count - a.enrolled_count);
  }

  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const all = await getCourses({ limit: 8 });
  const featured = all.filter((c) => c.is_featured);
  return featured.length > 0 ? featured : all.slice(0, 8);
}

export async function getTrendingCourses(limit = 8): Promise<Course[]> {
  return getCourses({ sort: "trending", limit });
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("courses")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url, headline)")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return data as unknown as Course;
      }
    }
  } catch (err) {
    console.warn("DB course by slug failed, checking mock:", err);
  }

  return MOCK_COURSES.find((c) => c.slug === slug) || null;
}

export async function getCourseById(id: string): Promise<Course | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("courses")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url, headline)")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return data as unknown as Course;
      }
    }
  } catch (err) {
    console.warn("DB course by id failed, checking mock:", err);
  }

  return MOCK_COURSES.find((c) => c.id === id) || null;
}

export async function getCreatorCourses(creatorId: string): Promise<Course[]> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("creator_id", creatorId);

      if (!error && data && data.length > 0) {
        return data as unknown as Course[];
      }
    }
  } catch (err) {
    console.warn("DB creator courses failed, checking mock:", err);
  }

  return MOCK_COURSES.filter((c) => c.creator_id === creatorId);
}
