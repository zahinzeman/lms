"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("email", email);
    formData.set("password", password);
    formData.set("agreedToTerms", "true");

    const res = await signUpAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
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
        <h2 className="text-2xl font-black text-ink tracking-tight">Create your account</h2>
        <p className="text-xs text-ink-muted mt-1">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-accent hover:underline">
            Sign in
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
                Full Name
              </label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tanvir Hossain"
                className="h-11 bg-surface-2"
              />
            </div>

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
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Password
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 bg-surface-2"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold h-11" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up Free"}
            </Button>
          </form>

          <p className="text-[11px] text-center text-ink-muted leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="/legal/terms" className="underline hover:text-ink">Terms of Service</Link> and{" "}
            <Link href="/legal/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
