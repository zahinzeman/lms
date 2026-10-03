export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar_url: string;
  quote: string;
  highlight: string;
  rating: number;
  course_taken?: string;
}

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Mahfuzur Rahman",
    role: "Frontend Engineer",
    company: "ShopUp",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    quote: "Bootcamp BD transformed how I think about frontend architecture. Going from tutorial hell to building production full-stack systems landed me a 2.5x salary hike within 6 months.",
    highlight: "2.5x salary hike within 6 months",
    rating: 5,
    course_taken: "Production Next.js 15 & Full-Stack Architecture",
  },
  {
    id: "test-2",
    name: "Nabila Tabassum",
    role: "Product Designer",
    company: "Remotely (Berlin)",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    quote: "The Figma Design System course and the weekly design community critiques were instrumental in helping me build a world-class portfolio that caught the attention of European recruiters.",
    highlight: "Landed an EU remote role",
    rating: 5,
    course_taken: "Modern Figma Design Systems & Token Architecture",
  },
  {
    id: "test-3",
    name: "Saif Chowdhury",
    role: "Founder",
    company: "ByteScale BD",
    avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
    quote: "Teaching on Bootcamp BD allowed me to reach 2,400+ ambitious developers across Bangladesh while generating predictable monthly revenue through courses and our private community.",
    highlight: "৳380k monthly creator earnings",
    rating: 5,
    course_taken: "Creator Studio Partner",
  },
];
