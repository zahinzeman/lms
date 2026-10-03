import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourses } from "@/lib/data/courses";
import { getProducts } from "@/lib/data/products";
import { categories } from "@/config/categories";
import { CourseCard } from "@/components/cards/course-card";
import { ProductCard } from "@/components/cards/product-card";
import { SearchPill } from "@/components/ui/search-pill";
import Link from "next/link";

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    level?: string;
    pricing?: string;
    type?: string;
    search?: string;
    sort?: any;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const activeType = params.type || "courses";

  const [courses, products] = await Promise.all([
    getCourses({
      category: params.category,
      level: params.level,
      pricing: params.pricing,
      search: params.search,
      sort: params.sort,
    }),
    getProducts({
      category: params.category,
      search: params.search,
    }),
  ]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <TopNav user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
                Explore Skills & Catalog
              </h1>
              <p className="text-sm text-ink-muted mt-1">
                Browse verified courses, digital downloads, and community guilds.
              </p>
            </div>

            <div className="w-full md:w-80">
              <SearchPill compact placeholder="Search by topic or creator..." />
            </div>
          </div>

          {/* Type switcher (Courses vs Products) */}
          <div className="flex items-center gap-2 pt-2">
            <Link
              href={`/explore?type=courses${params.category ? `&category=${params.category}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeType === "courses"
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-ink-muted hover:text-ink"
              }`}
            >
              Courses ({courses.length})
            </Link>
            <Link
              href={`/explore?type=products${params.category ? `&category=${params.category}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeType === "products"
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-ink-muted hover:text-ink"
              }`}
            >
              Digital Products ({products.length})
            </Link>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar pt-1">
            <Link
              href={`/explore?type=${activeType}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                !params.category
                  ? "bg-ink text-canvas font-bold"
                  : "bg-surface-2 text-ink-muted hover:text-ink"
              }`}
            >
              All Categories
            </Link>
            {categories.map((c) => {
              const isSelected = params.category === c.id;
              return (
                <Link
                  key={c.id}
                  href={`/explore?type=${activeType}&category=${c.id}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-ink text-canvas font-bold"
                      : "bg-surface-2 text-ink-muted hover:text-ink"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Catalog Grid */}
        {activeType === "courses" ? (
          courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-surface-1 p-8">
              <p className="text-lg font-bold text-ink">No courses found matching this criteria.</p>
              <p className="text-sm text-ink-muted mt-1">Try selecting a different category or clearing search filters.</p>
              <Link href="/explore" className="inline-block mt-4 text-sm font-bold text-accent hover:underline">
                Clear all filters
              </Link>
            </div>
          )
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-surface-1 p-8">
            <p className="text-lg font-bold text-ink">No digital products found.</p>
            <Link href="/explore?type=products" className="inline-block mt-4 text-sm font-bold text-accent hover:underline">
              Clear filters
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
