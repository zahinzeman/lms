import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "./session";
import { SessionUser } from "@/types/auth";

export async function requireUser(returnUrl = "/dashboard"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnUrl)}`);
  }
  if (user.profile.is_suspended) {
    redirect("/suspended");
  }
  return user;
}

export async function requireCreator(returnUrl = "/studio"): Promise<SessionUser> {
  const user = await requireUser(returnUrl);
  if (!user.isCreator) {
    redirect("/become-creator");
  }
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.isStaff) {
    notFound(); // Don't reveal that the admin route exists
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    notFound();
  }
  return user;
}
