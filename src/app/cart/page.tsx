import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils/format-currency";
import { ShoppingBag, ArrowRight, ShieldCheck, Trash2 } from "lucide-react";

export default function CartPage() {
  // Demo cart state
  const items = [
    {
      id: "cart-1",
      title: "Production Next.js 15 & Full-Stack Architecture",
      creator: "Tanvir Hossain",
      price_minor: 350000,
      type: "course",
    },
    {
      id: "cart-2",
      title: "Fintech & Banking Mobile UI System (Figma)",
      creator: "Samira Khan",
      price_minor: 180000,
      type: "product",
    },
  ];

  const subtotalMinor = items.reduce((acc, i) => acc + i.price_minor, 0);
  const discountMinor = 50000; // ৳500 promo code applied
  const totalMinor = subtotalMinor - discountMinor;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
          Shopping Cart ({items.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart items */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-surface-1 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-accent uppercase">
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                  <p className="text-xs text-ink-muted">By {item.creator}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-base font-black text-ink">{formatBDT(item.price_minor)}</p>
                  <button className="text-xs text-red-500 font-semibold hover:underline mt-1">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-surface-2 space-y-5">
              <h2 className="text-lg font-bold text-ink">Summary</h2>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatBDT(subtotalMinor)}</span>
                </div>
                <div className="flex justify-between text-accent">
                  <span>Promo Discount (WELCOME500)</span>
                  <span>-{formatBDT(discountMinor)}</span>
                </div>
                <div className="pt-2 flex justify-between text-base font-black text-ink">
                  <span>Total</span>
                  <span>{formatBDT(totalMinor)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button size="lg" variant="primary" className="w-full font-bold h-12">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-xs text-ink-muted justify-center">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Instant access &bull; 30-day refund guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
