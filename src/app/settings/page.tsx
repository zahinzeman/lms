import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Account Settings</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Manage your personal profile, notifications, and preferred currency.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-8 rounded-3xl bg-surface-1 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.profile.avatar_url || undefined}
              name={user?.profile.full_name || "User"}
              size={56}
            />
            <div>
              <h2 className="text-lg font-bold text-ink">{user?.profile.full_name || "Student"}</h2>
              <p className="text-xs text-ink-muted">@{user?.profile.handle || "handle"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Full Name
              </label>
              <Input
                defaultValue={user?.profile.full_name || ""}
                className="bg-surface-2 h-11"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Email Address
              </label>
              <Input
                defaultValue={user?.email || ""}
                disabled
                className="bg-surface-2 h-11 opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Professional Headline
              </label>
              <Input
                defaultValue={user?.profile.headline || "Lifelong learner"}
                className="bg-surface-2 h-11"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Preferred Currency
              </label>
              <Input
                defaultValue="BDT (Bangladeshi Taka ৳)"
                disabled
                className="bg-surface-2 h-11 opacity-70"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" className="font-bold">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
