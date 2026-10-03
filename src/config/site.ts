export const siteConfig = {
  name: "Bootcamp BD",
  shortName: "Bootcamp BD",
  tagline: "Learn skills that pay. Teach what you know.",
  description:
    "The leading South Asian digital learning marketplace and creator community. Discover top courses, toolkits, and mentor-led communities.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://bootcampbd.com",
  ogImage: "https://bootcampbd.com/og.jpg",
  supportEmail: "support@bootcampbd.com",
  links: {
    twitter: "https://twitter.com/bootcampbd",
    github: "https://github.com/bootcampbd",
    facebook: "https://facebook.com/bootcampbd",
    linkedin: "https://linkedin.com/company/bootcampbd",
    youtube: "https://youtube.com/@bootcampbd",
  },
  stats: {
    students: "85,000+",
    courses: "1,200+",
    creators: "340+",
    creatorEarnings: "৳4.2Cr+",
    avgRating: "4.8",
  },
};

export type SiteConfig = typeof siteConfig;
