import { createClient } from "@/lib/supabase/server";
import { DigitalProduct } from "@/types/commerce";
import { MOCK_PRODUCTS } from "@/lib/mock/products";

interface GetProductsOptions {
  category?: string;
  type?: string;
  search?: string;
  sort?: "popular" | "newest" | "price_asc" | "price_desc";
  limit?: number;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<DigitalProduct[]> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      let query = supabase
        .from("products")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url)");

      if (options.category) query = query.eq("category_id", options.category);
      if (options.type && options.type !== "all") query = query.eq("type", options.type);
      if (options.search) query = query.ilike("title", `%${options.search}%`);

      if (options.sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (options.sort === "price_asc") {
        query = query.order("price_minor", { ascending: true });
      } else if (options.sort === "price_desc") {
        query = query.order("price_minor", { ascending: false });
      } else {
        query = query.order("sales_count", { ascending: false });
      }

      if (options.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as DigitalProduct[];
      }
    }
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && (err as any).digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.warn("DB products query failed, using mock:", err);
  }

  let result = [...MOCK_PRODUCTS];
  if (options.category) result = result.filter((p) => p.category_id === options.category);
  if (options.type && options.type !== "all") result = result.filter((p) => p.type === options.type);
  if (options.search) {
    const s = options.search.toLowerCase();
    result = result.filter((p) => p.title.toLowerCase().includes(s) || p.subtitle?.toLowerCase().includes(s));
  }

  if (options.sort === "newest") {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (options.sort === "price_asc") {
    result.sort((a, b) => a.price_minor - b.price_minor);
  } else if (options.sort === "price_desc") {
    result.sort((a, b) => b.price_minor - a.price_minor);
  } else {
    result.sort((a, b) => b.sales_count - a.sales_count);
  }

  if (options.limit) result = result.slice(0, options.limit);
  return result;
}

export async function getProductBySlug(slug: string): Promise<DigitalProduct | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*, creator:profiles!creator_id(id, handle, full_name, avatar_url)")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) return data as unknown as DigitalProduct;
    }
  } catch (err) {
    console.warn("DB product by slug failed:", err);
  }

  return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
}
