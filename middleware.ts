import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Refresh session if Supabase is configured
  const response = await updateSession(request);

  // Check auth session via cookies
  const hasSupabaseAuth = request.cookies.getAll().some((c) => c.name.includes("-auth-token"));
  const demoRole = request.cookies.get("bbd_demo_role")?.value;
  const envDemo = process.env.NEXT_PUBLIC_DEMO_ROLE;
  const isAuthenticated = hasSupabaseAuth || Boolean(demoRole) || Boolean(envDemo);

  const activeRole = demoRole || envDemo || "student";
  const isCreator = activeRole === "creator" || activeRole === "admin";
  const isStaff = activeRole === "admin" || activeRole === "moderator";

  // Auth routes: redirect logged in users to /dashboard
  if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected app routes
  const protectedPrefixes = [
    "/dashboard",
    "/learning",
    "/library",
    "/wishlist",
    "/certificates",
    "/notifications",
    "/orders",
    "/subscriptions",
    "/settings",
    "/studio",
    "/admin",
  ];

  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !isAuthenticated) {
    const nextUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?next=${nextUrl}`, request.url));
  }

  // Guard studio routes: require creator
  if (pathname.startsWith("/studio") && isAuthenticated && !isCreator) {
    return NextResponse.redirect(new URL("/become-creator", request.url));
  }

  // Guard admin routes: require staff
  if (pathname.startsWith("/admin") && isAuthenticated && !isStaff) {
    // 404 rewrite so non-staff don't know it exists
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
