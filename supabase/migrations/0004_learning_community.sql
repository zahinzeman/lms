-- ==============================================================================
-- 0004: Learning Experience, Progress, Quizzes, Certificates & Communities
-- ==============================================================================

-- 1. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'purchase' CHECK (source IN ('purchase', 'free', 'subscription', 'coupon_full', 'admin_grant', 'bundle')),
    access_status TEXT NOT NULL DEFAULT 'active' CHECK (access_status IN ('active', 'revoked', 'expired')),
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    completed_lessons_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_lesson_id UUID,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- 2. Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    last_position_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lesson_id)
);

-- 3. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    pdf_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 4. Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description JSONB,
    cover_url TEXT,
    icon_url TEXT,
    tint TEXT NOT NULL DEFAULT '#ff385c',
    category_id UUID,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    is_listed BOOLEAN NOT NULL DEFAULT true,
    access_type TEXT NOT NULL DEFAULT 'free' CHECK (access_type IN ('free', 'paid', 'plan', 'invite')),
    price_monthly_minor BIGINT DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BDT' CHECK (currency IN ('BDT', 'USD')),
    member_count INTEGER NOT NULL DEFAULT 1,
    online_count INTEGER NOT NULL DEFAULT 0,
    posts_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Community Members Table
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    level INTEGER NOT NULL DEFAULT 1,
    points INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(community_id, user_id)
);

-- 6. Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL DEFAULT 'General',
    title TEXT NOT NULL,
    body_text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public certificates view" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Public communities view" ON public.communities FOR SELECT USING (is_listed = true);
CREATE POLICY "Community members can view posts" ON public.community_posts FOR SELECT USING (true);
