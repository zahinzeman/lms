"use client";

import { useState } from "react";
import { MOCK_FAQS } from "@/lib/mock/faqs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQSection() {
  const [filter, setFilter] = useState<string>("all");

  const faqs = filter === "all" ? MOCK_FAQS : MOCK_FAQS.filter((f) => f.category === filter);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-3">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-ink-muted">
          Everything you need to know about learning, teaching, and payouts on Bootcamp BD.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["all", "students", "creators", "billing"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                filter === cat
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-ink-muted hover:text-ink hover:bg-surface-3"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="rounded-2xl bg-surface-1 px-5 py-2 text-ink border-0"
          >
            <AccordionTrigger className="text-base font-bold text-left hover:no-underline hover:text-accent">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-ink-muted leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
