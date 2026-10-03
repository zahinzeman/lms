import { AppShell } from "@/components/layout/app-shell";
import { formatBDT } from "@/lib/utils/format-currency";
import { Receipt, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const orders = [
    {
      id: "ord-8492",
      date: "February 12, 2025",
      item: "Production Next.js 15 & Full-Stack Architecture",
      amountMinor: 350000,
      provider: "bKash",
      status: "Paid",
    },
    {
      id: "ord-8104",
      date: "January 20, 2025",
      item: "Fintech & Banking Mobile UI System (Figma)",
      amountMinor: 180000,
      provider: "SSLCommerz (Visa)",
      status: "Paid",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-accent" />
            <span>Order History</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Receipts and invoices for your course enrollments and digital asset purchases.
          </p>
        </div>

        <div className="space-y-3">
          {orders.map((ord) => (
            <div key={ord.id} className="p-6 rounded-3xl bg-surface-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-ink">#{ord.id}</span>
                  <span className="text-xs text-ink-muted">&bull; {ord.date}</span>
                </div>
                <h3 className="text-base font-bold text-ink">{ord.item}</h3>
                <p className="text-xs text-ink-muted">Paid via {ord.provider}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <span className="text-base font-black text-ink">{formatBDT(ord.amountMinor)}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  {ord.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
