-- Seed 0001: 12 Top Categories & Subcategories
-- Instructions to make yourself admin:
-- insert into public.user_roles (user_id, role)
-- select id, 'admin'::public.app_role from auth.users where email = 'YOUR_EMAIL@EXAMPLE.COM'
-- on conflict do nothing;

insert into public.categories (id, name, slug, icon, tint, description, position, is_active)
values
  ('11111111-1111-1111-1111-111111111101', 'Development', 'development', 'Code2', 'blue', 'Web development, full-stack, mobile apps, DevOps, and backend engineering.', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Design', 'design', 'Palette', 'violet', 'UI/UX, Figma mastery, graphic design, design systems, and product branding.', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Business', 'business', 'Briefcase', 'amber', 'Entrepreneurship, agency scaling, startup leadership, and operations.', 3, true),
  ('11111111-1111-1111-1111-111111111104', 'Marketing', 'marketing', 'Megaphone', 'rose', 'Digital marketing, Meta & Google ads, SEO, copywriting, and growth hacking.', 4, true),
  ('11111111-1111-1111-1111-111111111105', 'AI & Data', 'ai-data', 'Sparkles', 'plum', 'Machine learning, prompt engineering, generative AI, SQL, and data analytics.', 5, true),
  ('11111111-1111-1111-1111-111111111106', 'Freelancing', 'freelancing', 'Laptop', 'green', 'Upwork, Fiverr, international client acquisition, proposal writing, and pricing.', 6, true),
  ('11111111-1111-1111-1111-111111111107', 'Photography & Video', 'photography-video', 'Video', 'rose', 'Premiere Pro, DaVinci Resolve, CapCut, cinematography, and YouTube editing.', 7, true),
  ('11111111-1111-1111-1111-111111111108', 'Personal Growth', 'personal-growth', 'Flame', 'amber', 'Productivity, public speaking, communication, negotiation, and high performance.', 8, true),
  ('11111111-1111-1111-1111-111111111109', 'Language & Test Prep', 'language-test-prep', 'Languages', 'blue', 'IELTS preparation, spoken English, corporate communication, and vocabulary.', 9, true),
  ('11111111-1111-1111-1111-111111111110', 'Finance', 'finance', 'TrendingUp', 'green', 'Stock market, personal budgeting, financial modeling, accounting, and taxation.', 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Music', 'music', 'Music', 'violet', 'Music production, FL Studio, sound design, guitar, vocal training, and mixing.', 11, true),
  ('11111111-1111-1111-1111-111111111112', 'Health', 'health', 'Activity', 'plum', 'Fitness coaching, nutrition planning, mental resilience, posture, and wellness.', 12, true)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  tint = excluded.tint,
  description = excluded.description,
  position = excluded.position;

-- Subcategories
insert into public.categories (name, slug, parent_id, icon, tint, position)
values
  ('Web Development', 'web-development', '11111111-1111-1111-1111-111111111101', 'Code', 'blue', 1),
  ('Mobile Apps', 'mobile-apps', '11111111-1111-1111-1111-111111111101', 'Smartphone', 'blue', 2),
  ('Python & Backend', 'python-backend', '11111111-1111-1111-1111-111111111101', 'Server', 'blue', 3),
  ('UI/UX Design', 'ui-ux', '11111111-1111-1111-1111-111111111102', 'Layout', 'violet', 1),
  ('Graphic Design', 'graphic-design', '11111111-1111-1111-1111-111111111102', 'PenTool', 'violet', 2),
  ('Startup Building', 'startup-building', '11111111-1111-1111-1111-111111111103', 'Rocket', 'amber', 1),
  ('Performance Marketing', 'performance-marketing', '11111111-1111-1111-1111-111111111104', 'Target', 'rose', 1),
  ('AI for Work', 'ai-for-work', '11111111-1111-1111-1111-111111111105', 'Bot', 'plum', 1),
  ('Upwork & Remote', 'upwork-remote', '11111111-1111-1111-1111-111111111106', 'Globe', 'green', 1),
  ('Video Editing', 'video-editing', '11111111-1111-1111-1111-111111111107', 'Film', 'rose', 1),
  ('IELTS Prep', 'ielts-prep', '11111111-1111-1111-1111-111111111109', 'GraduationCap', 'blue', 1)
on conflict (slug) do nothing;
