import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Profile, SessionUser } from "@/types/auth";
import { AppRole } from "@/types/database";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const demoRoleCookie = cookieStore.get("bbd_demo_role")?.value;
  const envDemoRole = process.env.NEXT_PUBLIC_DEMO_ROLE;
  const activeRole = (demoRoleCookie || envDemoRole) as AppRole | undefined;

  // If Supabase env vars exist, attempt real authentication
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Query user roles and profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const profile = profileData as unknown as Profile | null;

        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const roles: AppRole[] = rolesData && rolesData.length > 0 
          ? (rolesData.map((r: any) => r.role as AppRole))
          : ["student"];

        const isCreator = roles.includes("creator") || profile?.creator_status === "approved";
        const isStaff = roles.includes("admin") || roles.includes("moderator");
        const isAdmin = roles.includes("admin");

        return {
          id: user.id,
          email: user.email || "",
          profile: profile || {
            id: user.id,
            handle: user.email?.split("@")[0] || "user",
            full_name: (user.user_metadata?.full_name as string) || "Student",
            avatar_url: null,
            headline: "Lifelong learner",
            bio: "",
            country: "BD",
            timezone: "Asia/Dhaka",
            locale: "en",
            preferred_currency: "BDT",
            website: null,
            socials: {},
            intent: "learn",
            creator_status: isCreator ? "approved" : "none",
            onboarding_completed_at: new Date().toISOString(),
            is_suspended: false,
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          roles,
          isCreator,
          isStaff,
          isAdmin,
        };
      }
    } catch (e) {
      console.warn("Supabase auth check skipped or failed:", e);
    }
  }

  // Fallback to demo role if provided
  if (activeRole) {
    const roles: AppRole[] = 
      activeRole === "admin" 
        ? ["admin", "moderator", "creator", "student"]
        : activeRole === "creator"
        ? ["creator", "student"]
        : ["student"];

    return {
      id: "demo-user-12345",
      email: `${activeRole}@bootcampbd.com`,
      profile: {
        id: "demo-user-12345",
        handle: `${activeRole}_demo`,
        full_name: activeRole === "admin" ? "Sabbir Ahmed (Admin)" : activeRole === "creator" ? "Tanvir Hossain (Creator)" : "Rahim Khan (Student)",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        headline: activeRole === "creator" ? "Senior Full-Stack Engineer & Instructor" : "Product & Tech Enthusiast",
        bio: "Passionate about building scalable web platforms and teaching modern skills.",
        country: "BD",
        timezone: "Asia/Dhaka",
        locale: "en",
        preferred_currency: "BDT",
        website: "https://bootcampbd.com",
        socials: { linkedin: "https://linkedin.com", github: "https://github.com" },
        intent: activeRole === "creator" ? "teach" : "learn",
        creator_status: activeRole === "creator" || activeRole === "admin" ? "approved" : "none",
        onboarding_completed_at: new Date().toISOString(),
        is_suspended: false,
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      roles,
      isCreator: roles.includes("creator") || roles.includes("admin"),
      isStaff: roles.includes("admin") || roles.includes("moderator"),
      isAdmin: roles.includes("admin"),
    };
  }

  return null;
});
