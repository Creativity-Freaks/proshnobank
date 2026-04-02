-- Proshnobank full Supabase SQL setup (A to Z)
-- Safe to run on a fresh database and mostly safe to re-run.

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'difficulty_level'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END
$$;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- 2) Core tables
CREATE TABLE IF NOT EXISTS public.question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  score NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  negative_marking BOOLEAN NOT NULL DEFAULT false,
  marks_per_question NUMERIC(5,2) NOT NULL DEFAULT 1,
  negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_id_role_unique
  ON public.user_roles (user_id, role);

CREATE TABLE IF NOT EXISTS public.exam_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  marks_per_question NUMERIC(5,2) NOT NULL DEFAULT 1,
  negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0,
  difficulty TEXT,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  subjects_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  topics JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating NUMERIC(3,1),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT exam_templates_question_count_check CHECK (question_count >= 0),
  CONSTRAINT exam_templates_duration_check CHECK (duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS public.live_exam_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  participants INTEGER NOT NULL DEFAULT 0,
  prize TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT live_exam_events_participants_check CHECK (participants >= 0),
  CONSTRAINT live_exam_events_status_check CHECK (status IN ('upcoming', 'starting-soon', 'live'))
);

-- 3) Performance indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON public.question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON public.question_bank(topic);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_created_at ON public.exam_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_exam_events_start_time ON public.live_exam_events(start_time);
CREATE INDEX IF NOT EXISTS idx_live_exam_events_template_id ON public.live_exam_events(template_id);

-- 4) Role helper function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5) Signup auto-role assignment trigger function
CREATE OR REPLACE FUNCTION public.assign_signup_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT;
  signup_role public.app_role;
BEGIN
  -- Auto-confirm user email so signup does not require email confirmation.
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
  WHERE id = new.id;

  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'registration_type', 'student'));

  IF requested_role = 'teacher' THEN
    signup_role := 'teacher'::public.app_role;
  ELSE
    signup_role := 'user'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, signup_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_signup_role();

-- 6) Backfill role rows for existing users who have no role row
INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE
    WHEN lower(coalesce(u.raw_user_meta_data ->> 'registration_type', 'student')) = 'teacher'
      THEN 'teacher'::public.app_role
    ELSE 'user'::public.app_role
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles ur
  WHERE ur.user_id = u.id
);

-- Confirm old users as well.
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 7) Enable RLS
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_exam_events ENABLE ROW LEVEL SECURITY;

-- 8) Policies
-- question_bank
DROP POLICY IF EXISTS "Anyone can view questions" ON public.question_bank;
CREATE POLICY "Anyone can view questions"
ON public.question_bank
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert questions" ON public.question_bank;
CREATE POLICY "Admins can insert questions"
ON public.question_bank
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update questions" ON public.question_bank;
CREATE POLICY "Admins can update questions"
ON public.question_bank
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete questions" ON public.question_bank;
CREATE POLICY "Admins can delete questions"
ON public.question_bank
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- exam_attempts
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.exam_attempts;
CREATE POLICY "Users can view their own attempts"
ON public.exam_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.exam_attempts;
CREATE POLICY "Users can insert their own attempts"
ON public.exam_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own attempts" ON public.exam_attempts;
CREATE POLICY "Users can update their own attempts"
ON public.exam_attempts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- exam_templates
DROP POLICY IF EXISTS "Anyone can view exam templates" ON public.exam_templates;
CREATE POLICY "Anyone can view exam templates"
ON public.exam_templates
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert exam templates" ON public.exam_templates;
CREATE POLICY "Admins can insert exam templates"
ON public.exam_templates
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update exam templates" ON public.exam_templates;
CREATE POLICY "Admins can update exam templates"
ON public.exam_templates
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete exam templates" ON public.exam_templates;
CREATE POLICY "Admins can delete exam templates"
ON public.exam_templates
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- live_exam_events
DROP POLICY IF EXISTS "Anyone can view live exam events" ON public.live_exam_events;
CREATE POLICY "Anyone can view live exam events"
ON public.live_exam_events
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert live exam events" ON public.live_exam_events;
CREATE POLICY "Admins can insert live exam events"
ON public.live_exam_events
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update live exam events" ON public.live_exam_events;
CREATE POLICY "Admins can update live exam events"
ON public.live_exam_events
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete live exam events" ON public.live_exam_events;
CREATE POLICY "Admins can delete live exam events"
ON public.live_exam_events
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9) Storage bucket + policies for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
