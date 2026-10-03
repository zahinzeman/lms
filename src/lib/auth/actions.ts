"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  intent: z.enum(["learn", "teach", "both"]).default("learn"),
  agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to the Terms"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function signUpAction(formData: FormData) {
  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    intent: formData.get("intent") || "learn",
    agreedToTerms: formData.get("agreedToTerms") === "on" || formData.get("agreedToTerms") === "true",
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix form errors",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Check if Supabase env vars exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Demo mode: set cookie and redirect
    const cookieStore = await cookies();
    cookieStore.set("bbd_demo_role", parsed.data.intent === "teach" ? "creator" : "student");
    return { ok: true, message: "Demo mode: Account registered successfully! Redirecting..." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          intent: parsed.data.intent,
        },
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return {
      ok: true,
      message: data.session ? "Account created successfully!" : "Please check your email to verify your account.",
    };
  } catch (err: any) {
    return { ok: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function signInAction(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please enter valid credentials",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const cookieStore = await cookies();
    cookieStore.set("bbd_demo_role", "student");
    return { ok: true, message: "Demo mode signed in successfully!" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Login failed" };
  }
}

export async function signInWithMagicLinkAction(formData: FormData) {
  const email = formData.get("email");
  const parsed = magicLinkSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email" };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { ok: true, message: "Magic link email simulated in demo mode." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, message: "Magic link sent! Please check your inbox." };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bbd_demo_role");
  cookieStore.delete("bbd_active_workspace");

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function setDemoRoleAction(role: "student" | "creator" | "admin" | "visitor") {
  const cookieStore = await cookies();
  if (role === "visitor") {
    cookieStore.delete("bbd_demo_role");
    cookieStore.delete("bbd_active_workspace");
  } else {
    cookieStore.set("bbd_demo_role", role);
    cookieStore.set("bbd_active_workspace", role === "admin" ? "admin" : role === "creator" ? "creator" : "learning");
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
