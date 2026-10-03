"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { ArrowLeft, Sparkles, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const res = await signInAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const setDemoCreds = (type: "student" | "creator" | "admin") => {
    setEmail(`${type}@bootcampbd.com`);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-fg font-black text-lg">
            B
          </div>
          <span className="text-xl font-extrabold text-ink">{siteConfig.name}</span>
        </div>
        <h2 className="text-2xl font-black text-ink tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-ink-muted mt-1">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-bold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-1 py-8 px-6 sm:rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="h-11 bg-surface-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-accent font-semibold hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 bg-surface-2"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold h-11" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2.5 text-center">
              Instant Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCreds("student")}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-bold text-ink text-center transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setDemoCreds("creator")}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-bold text-accent text-center transition-colors"
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => setDemoCreds("admin")}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-bold text-purple-500 text-center transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
