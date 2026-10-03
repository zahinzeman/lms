"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils/format-currency";
import { ShieldCheck, ArrowLeft, Check, Lock } from "lucide-react";

export function CheckoutForm() {
  const [provider, setProvider] = useState<"bkash" | "nagad" | "card" | "stripe">("bkash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalMinor = 480000; // ৳4,800

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-ink">Payment Successful!</h1>
        <p className="text-sm text-ink-muted">
          Your enrollment is confirmed. All course lessons and files have been activated on your account.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/learning">
            <Button size="lg" variant="primary" className="font-bold">
              Go to My Learning
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="font-bold">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Cart</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Checkout & Payment</h1>
        <p className="text-xs text-ink-muted mt-1">Select your preferred payment gateway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Payment Method Selector */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setProvider("bkash")}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                provider === "bkash" ? "bg-accent/10 ring-2 ring-accent" : "bg-surface-1"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-xl bg-pink-500 text-white font-black text-xs flex items-center justify-center">
                  bK
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">bKash Direct Checkout</p>
                  <p className="text-xs text-ink-muted">Instant mobile wallet verification</p>
                </div>
              </div>
              {provider === "bkash" && <Check className="h-4 w-4 text-accent" />}
            </button>

            <button
              type="button"
              onClick={() => setProvider("nagad")}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                provider === "nagad" ? "bg-accent/10 ring-2 ring-accent" : "bg-surface-1"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  NG
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Nagad Payment</p>
                  <p className="text-xs text-ink-muted">Mobile banking gateway</p>
                </div>
              </div>
              {provider === "nagad" && <Check className="h-4 w-4 text-accent" />}
            </button>

            <button
              type="button"
              onClick={() => setProvider("card")}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                provider === "card" ? "bg-accent/10 ring-2 ring-accent" : "bg-surface-1"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  BD
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Local Cards & Net Banking</p>
                  <p className="text-xs text-ink-muted">Visa, Mastercard, DBBL Nexus via SSLCommerz</p>
                </div>
              </div>
              {provider === "card" && <Check className="h-4 w-4 text-accent" />}
            </button>

            <button
              type="button"
              onClick={() => setProvider("stripe")}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                provider === "stripe" ? "bg-accent/10 ring-2 ring-accent" : "bg-surface-1"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  ST
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">International Card (Stripe)</p>
                  <p className="text-xs text-ink-muted">Pay in USD with any international card</p>
                </div>
              </div>
              {provider === "stripe" && <Check className="h-4 w-4 text-accent" />}
            </button>
          </div>
        </div>

        {/* Checkout summary */}
        <div className="md:col-span-5">
          <div className="p-6 rounded-3xl bg-surface-2 space-y-4">
            <h3 className="text-base font-bold text-ink">Order Amount</h3>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-ink-muted font-bold">Total to pay:</span>
              <span className="text-2xl font-black text-ink">{formatBDT(totalMinor)}</span>
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full font-bold h-12"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isProcessing ? "Connecting Gateway..." : `Pay ${formatBDT(totalMinor)}`}
            </Button>

            <div className="flex items-center gap-2 text-xs text-ink-muted justify-center pt-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>256-bit encrypted SSL checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
