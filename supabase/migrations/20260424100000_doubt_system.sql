-- Doubt Solving System for Proshnobank

-- 1) Create doubt_status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'doubt_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.doubt_status AS ENUM ('open', 'answered', 'resolved', 'closed');
  END IF;
END
$$;

-- 2) Create doubts table
CREATE TABLE IF NOT EXISTS public.doubts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.question_bank(id) ON DELETE SET NULL,
  exam_attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.doubt_status NOT NULL DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  views INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3) Create doubt_answers table (responses from teachers/admins)
CREATE TABLE IF NOT EXISTS public.doubt_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  answerer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_best_answer BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4) Create doubt_helpful table (users who found doubt/answer helpful)
CREATE TABLE IF NOT EXISTS public.doubt_helpful (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doubt_id UUID REFERENCES public.doubts(id) ON DELETE CASCADE,
  doubt_answer_id UUID REFERENCES public.doubt_answers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_doubt CHECK (
    (doubt_id IS NOT NULL AND doubt_answer_id IS NULL) OR
    (doubt_id IS NULL AND doubt_answer_id IS NOT NULL)
  ),
  UNIQUE(user_id, doubt_id),
  UNIQUE(user_id, doubt_answer_id)
);

-- 5) Create bookmarks table (students bookmark questions/exams)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.question_bank(id) ON DELETE CASCADE,
  exam_template_id UUID REFERENCES public.exam_templates(id) ON DELETE CASCADE,
  bookmark_type TEXT NOT NULL CHECK (bookmark_type IN ('question', 'exam')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id),
  UNIQUE(user_id, exam_template_id)
);

-- 6) Create student_progress table (track learning progress)
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  strength BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, topic)
);

-- 7) Create performance_stats materialized view
CREATE TABLE IF NOT EXISTS public.user_stats_cache (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_exams INTEGER NOT NULL DEFAULT 0,
  avg_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_study_time_hours INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_doubts_student_id ON public.doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_status ON public.doubts(status);
CREATE INDEX IF NOT EXISTS idx_doubts_subject ON public.doubts(subject);
CREATE INDEX IF NOT EXISTS idx_doubts_created_at ON public.doubts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doubt_answers_doubt_id ON public.doubt_answers(doubt_id);
CREATE INDEX IF NOT EXISTS idx_doubt_answers_answerer_id ON public.doubt_answers(answerer_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON public.bookmarks(question_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_exam_template_id ON public.bookmarks(exam_template_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_subject ON public.student_progress(subject);
CREATE INDEX IF NOT EXISTS idx_student_progress_accuracy ON public.student_progress(accuracy DESC);

-- 9) Enable RLS
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats_cache ENABLE ROW LEVEL SECURITY;

-- 10) RLS Policies
-- Doubts: Students can view all open doubts, create their own, update their own
CREATE POLICY "Students can view open doubts" ON public.doubts
  FOR SELECT USING (
    status = 'open' OR student_id = auth.uid()
  );

CREATE POLICY "Students can create doubts" ON public.doubts
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "Students can update own doubts" ON public.doubts
  FOR UPDATE USING (student_id = auth.uid());

-- Doubt answers: anyone can view, teachers can create
CREATE POLICY "Anyone can view doubt answers" ON public.doubt_answers
  FOR SELECT USING (true);

-- Bookmarks: users can only access their own
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Student progress: users can only view their own
CREATE POLICY "Users can view own progress" ON public.student_progress
  FOR SELECT USING (user_id = auth.uid());

-- Stats cache: users can view their own
CREATE POLICY "Users can view own stats" ON public.user_stats_cache
  FOR SELECT USING (user_id = auth.uid());
