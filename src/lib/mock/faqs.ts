export interface FAQItem {
  id: string;
  category: "students" | "creators" | "billing" | "general";
  question: string;
  answer: string;
}

export const MOCK_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "general",
    question: "What is Bootcamp BD?",
    answer: "Bootcamp BD is a modern learning platform and creator marketplace tailored for tech, design, AI, and business creators in Bangladesh and South Asia. It uniquely unites Udemy-style video courses & digital assets with Skool-style community gamification, leaderboard progression, and live interaction.",
  },
  {
    id: "faq-2",
    category: "students",
    question: "How do I access courses after purchasing?",
    answer: "Access is instant. Once your payment is completed via bKash, Nagad, card, or Stripe, the course automatically appears in your 'My Learning' dashboard with lifetime access to all lessons, quizzes, resources, and community forums.",
  },
  {
    id: "faq-3",
    category: "billing",
    question: "Which payment methods are supported in Bangladesh?",
    answer: "We support seamless local checkout via bKash, Nagad, Rocket, Upay, and all Bangladeshi Visa / Mastercard debit & credit cards through SSLCommerz. We also support international payments via Stripe in USD.",
  },
  {
    id: "faq-4",
    category: "creators",
    question: "How do creator payouts and platform fees work?",
    answer: "On our Free tier, creators keep 85% of sales (15% platform fee). On Pro, creators keep 95% (5% fee), and on Business, creators keep 100% (0% fee). Earnings are paid out bi-weekly directly to your Bangladeshi bank account or bKash merchant wallet.",
  },
  {
    id: "faq-5",
    category: "creators",
    question: "Can I host both video courses and downloadable digital products?",
    answer: "Yes! You can publish comprehensive structured video courses with quizzes & certificates, sell downloadable assets (templates, source code, Figma files, ebooks, presets), or create monthly subscription communities.",
  },
  {
    id: "faq-6",
    category: "students",
    question: "Do I get verified certificates upon course completion?",
    answer: "Yes. When you complete 100% of the lessons and pass the final quiz in eligible courses, a cryptographically signed certificate with a unique verification serial number and public URL is minted to your profile.",
  },
];
