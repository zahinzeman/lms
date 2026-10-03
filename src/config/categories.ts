export type CategoryTint =
  | "rose"
  | "blue"
  | "green"
  | "amber"
  | "violet"
  | "plum";

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  tint: CategoryTint;
  description: string;
  subcategories: SubCategory[];
}

export const categories: Category[] = [
  {
    id: "cat-dev",
    name: "Development",
    slug: "development",
    icon: "Code2",
    tint: "blue",
    description: "Web development, full-stack, mobile apps, DevOps, and backend engineering.",
    subcategories: [
      { id: "sub-web", name: "Web Development", slug: "web-development", description: "Frontend, React, Next.js, and CSS" },
      { id: "sub-mobile", name: "Mobile Development", slug: "mobile-development", description: "Flutter, React Native, iOS, Android" },
      { id: "sub-python", name: "Python & Backend", slug: "python-backend", description: "Node.js, Django, FastAPI, Go" },
      { id: "sub-devops", name: "DevOps & Cloud", slug: "devops-cloud", description: "Docker, Kubernetes, AWS, Linux" },
    ],
  },
  {
    id: "cat-design",
    name: "Design",
    slug: "design",
    icon: "Palette",
    tint: "violet",
    description: "UI/UX, Figma mastery, graphic design, design systems, and product branding.",
    subcategories: [
      { id: "sub-uiux", name: "UI/UX Design", slug: "ui-ux", description: "Figma, user research, wireframing" },
      { id: "sub-graphic", name: "Graphic Design", slug: "graphic-design", description: "Photoshop, Illustrator, Typography" },
      { id: "sub-motion", name: "Motion & 3D", slug: "motion-3d", description: "After Effects, Blender, Spline" },
    ],
  },
  {
    id: "cat-business",
    name: "Business",
    slug: "business",
    icon: "Briefcase",
    tint: "amber",
    description: "Entrepreneurship, agency scaling, startup leadership, and operations.",
    subcategories: [
      { id: "sub-startup", name: "Startup Building", slug: "startup-building", description: "Product discovery, pitching, MVP" },
      { id: "sub-ecom", name: "E-Commerce", slug: "e-commerce", description: "Shopify, F-Commerce, supply chain" },
      { id: "sub-management", name: "Product Management", slug: "product-management", description: "Agile, roadmaps, metrics" },
    ],
  },
  {
    id: "cat-marketing",
    name: "Marketing",
    slug: "marketing",
    icon: "Megaphone",
    tint: "rose",
    description: "Digital marketing, Meta & Google ads, SEO, copywriting, and growth hacking.",
    subcategories: [
      { id: "sub-meta-ads", name: "Performance Marketing", slug: "performance-marketing", description: "Meta Ads, Google Ads, TikTok" },
      { id: "sub-seo", name: "SEO & Content", slug: "seo-content", description: "Search engine ranking, blogging" },
      { id: "sub-copy", name: "Copywriting", slug: "copywriting", description: "High-converting sales copy, email" },
    ],
  },
  {
    id: "cat-ai",
    name: "AI & Data",
    slug: "ai-data",
    icon: "Sparkles",
    tint: "plum",
    description: "Machine learning, prompt engineering, generative AI, SQL, and data analytics.",
    subcategories: [
      { id: "sub-prompt", name: "AI for Work & Creators", slug: "ai-for-work", description: "ChatGPT, Midjourney, Claude" },
      { id: "sub-data-analyst", name: "Data Analytics", slug: "data-analytics", description: "Excel, Power BI, SQL, Pandas" },
      { id: "sub-ml", name: "Machine Learning & LLMs", slug: "ml-llms", description: "PyTorch, fine-tuning, embeddings" },
    ],
  },
  {
    id: "cat-freelance",
    name: "Freelancing",
    slug: "freelancing",
    icon: "Laptop",
    tint: "green",
    description: "Upwork, Fiverr, international client acquisition, proposal writing, and pricing.",
    subcategories: [
      { id: "sub-upwork", name: "Upwork & Direct Clients", slug: "upwork-clients", description: "Bidding, proposals, contract closing" },
      { id: "sub-fiverr", name: "Fiverr Success", slug: "fiverr-success", description: "Gig ranking, customer communication" },
      { id: "sub-remote", name: "Remote Job Hunting", slug: "remote-job-hunting", description: "LinkedIn optimization, global interviews" },
    ],
  },
  {
    id: "cat-video",
    name: "Photography & Video",
    slug: "photography-video",
    icon: "Video",
    tint: "rose",
    description: "Premiere Pro, DaVinci Resolve, CapCut, cinematography, and YouTube editing.",
    subcategories: [
      { id: "sub-video-edit", name: "Video Editing", slug: "video-editing", description: "Premiere Pro, DaVinci Resolve" },
      { id: "sub-shorts", name: "Short-Form Content", slug: "short-form-content", description: "TikTok, Reels, retention editing" },
      { id: "sub-cinematography", name: "Color Grading & Lighting", slug: "color-grading", description: "LUTs, node trees, camera gear" },
    ],
  },
  {
    id: "cat-growth",
    name: "Personal Growth",
    slug: "personal-growth",
    icon: "Flame",
    tint: "amber",
    description: "Productivity, public speaking, communication, negotiation, and high performance.",
    subcategories: [
      { id: "sub-productivity", name: "Productivity & Systems", slug: "productivity", description: "Notion systems, time management" },
      { id: "sub-comm", name: "Executive Communication", slug: "communication", description: "Speaking with confidence, pitching" },
    ],
  },
  {
    id: "cat-language",
    name: "Language & Test Prep",
    slug: "language-test-prep",
    icon: "Languages",
    tint: "blue",
    description: "IELTS preparation, spoken English, corporate communication, and vocabulary.",
    subcategories: [
      { id: "sub-ielts", name: "IELTS 7.5+ Strategy", slug: "ielts-prep", description: "Writing, Speaking, Reading, Listening" },
      { id: "sub-spoken", name: "Spoken English Fluency", slug: "spoken-english", description: "Pronunciation, natural conversation" },
    ],
  },
  {
    id: "cat-finance",
    name: "Finance",
    slug: "finance",
    icon: "TrendingUp",
    tint: "green",
    description: "Stock market, personal budgeting, financial modeling, accounting, and taxation.",
    subcategories: [
      { id: "sub-investing", name: "Investing & Stocks", slug: "investing", description: "Fundamental analysis, equity" },
      { id: "sub-financial-mod", name: "Financial Modeling", slug: "financial-modeling", description: "Excel models, valuations" },
    ],
  },
  {
    id: "cat-music",
    name: "Music",
    slug: "music",
    icon: "Music",
    tint: "violet",
    description: "Music production, FL Studio, sound design, guitar, vocal training, and mixing.",
    subcategories: [
      { id: "sub-prod", name: "Music Production", slug: "music-production", description: "FL Studio, Ableton, beat making" },
      { id: "sub-mix", name: "Mixing & Mastering", slug: "mixing-mastering", description: "EQ, compression, balance" },
    ],
  },
  {
    id: "cat-health",
    name: "Health",
    slug: "health",
    icon: "Activity",
    tint: "plum",
    description: "Fitness coaching, nutrition planning, mental resilience, posture, and wellness.",
    subcategories: [
      { id: "sub-fitness", name: "Fitness & Strength", slug: "fitness-strength", description: "Workout routines, ergonomics" },
      { id: "sub-nutrition", name: "Nutrition & Diet", slug: "nutrition", description: "Healthy eating, habit tracking" },
    ],
  },
];
