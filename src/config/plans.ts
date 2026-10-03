export interface PlanTier {
  id: "free" | "pro" | "business";
  name: string;
  tagline: string;
  feeBps: number; // 1500 = 15%, 500 = 5%, 0 = 0%
  feePercentage: number;
  monthlyPriceBDT: number; // minor units: 250000 = ৳2,500
  yearlyPriceBDT: number; // minor units: 2500000 = ৳25,000 (2 months free)
  monthlyPriceUSD: number; // minor units: 2500 = $25
  yearlyPriceUSD: number; // minor units: 25000 = $250
  features: string[];
  limits: {
    courses: number | "unlimited";
    communities: number | "unlimited";
    teamSeats: number;
    customDomain: boolean;
    payoutPriority: "standard" | "priority" | "instant";
  };
  isRecommended?: boolean;
}

export const creatorPlans: PlanTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Perfect for starting your teaching journey",
    feeBps: 1500,
    feePercentage: 15,
    monthlyPriceBDT: 0,
    yearlyPriceBDT: 0,
    monthlyPriceUSD: 0,
    yearlyPriceUSD: 0,
    features: [
      "Up to 3 courses",
      "1 community with up to 100 members",
      "Standard payouts (14 days)",
      "Basic student analytics",
      "Standard video hosting",
      "15% platform transaction fee",
    ],
    limits: {
      courses: 3,
      communities: 1,
      teamSeats: 1,
      customDomain: false,
      payoutPriority: "standard",
    },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For active educators and growing creators",
    feeBps: 500,
    feePercentage: 5,
    monthlyPriceBDT: 250000, // ৳2,500
    yearlyPriceBDT: 2500000, // ৳25,000 (save ৳5,000)
    monthlyPriceUSD: 2500, // $25
    yearlyPriceUSD: 25000, // $250
    isRecommended: true,
    features: [
      "Unlimited courses and digital products",
      "Unlimited communities & members",
      "Custom coupons & promo codes",
      "Priority weekly payouts",
      "Student completion certificates",
      "Branded creator storefront",
      "Only 5% platform transaction fee",
    ],
    limits: {
      courses: "unlimited",
      communities: "unlimited",
      teamSeats: 3,
      customDomain: true,
      payoutPriority: "priority",
    },
  },
  {
    id: "business",
    name: "Business",
    tagline: "For coaching institutes and creator studios",
    feeBps: 0,
    feePercentage: 0,
    monthlyPriceBDT: 750000, // ৳7,500
    yearlyPriceBDT: 7500000, // ৳75,000 (save ৳15,000)
    monthlyPriceUSD: 7500, // $75
    yearlyPriceUSD: 75000, // $750
    features: [
      "0% platform transaction fee (keep 100%)",
      "Everything in Pro",
      "Dedicated account manager",
      "Same-day instant payouts",
      "Unlimited team seats & TAs",
      "Custom SSL domain & white-label player",
      "Developer API & webhook access",
    ],
    limits: {
      courses: "unlimited",
      communities: "unlimited",
      teamSeats: 10,
      customDomain: true,
      payoutPriority: "instant",
    },
  },
];
