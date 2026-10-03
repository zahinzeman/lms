import { AppShell } from "@/components/layout/app-shell";
import { Bell, Sparkles, MessageSquare, Award } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: "notif-1",
      icon: Sparkles,
      color: "text-accent bg-accent/10",
      title: "New Level Unlocked: Level 4 Builder!",
      desc: "You earned 250 XP from submitting your full-stack assignment. You are now in the top 10% of active learners.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: "notif-2",
      icon: MessageSquare,
      color: "text-blue-500 bg-blue-500/10",
      title: "Tanvir Hossain replied to your question",
      desc: "'For Next.js 15 route caching, you should use the connection() API before dynamic reads...'",
      time: "1 day ago",
      unread: false,
    },
    {
      id: "notif-3",
      icon: Award,
      color: "text-emerald-500 bg-emerald-500/10",
      title: "Certificate Issued: Modern Figma Systems",
      desc: "Your course completion certificate (BBD-2025-72014) is now live on your public profile.",
      time: "3 days ago",
      unread: false,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-accent" />
            <span>Notifications</span>
          </h1>
          <button className="text-xs font-bold text-accent hover:underline">
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`p-5 rounded-2xl flex items-start gap-4 transition-colors ${
                  n.unread ? "bg-surface-1" : "bg-surface-1/50 opacity-80"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">{n.title}</p>
                    <span className="text-[11px] text-ink-muted">{n.time}</span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
