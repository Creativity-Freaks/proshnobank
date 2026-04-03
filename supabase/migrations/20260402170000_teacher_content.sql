-- Teacher content support: teacher-owned questions, templates, live events, and question-paper uploads

-- 1) Teacher-owned questions
ALTER TABLE public.question_bank
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.question_bank
ALTER COLUMN created_by SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_question_bank_created_by ON public.question_bank(created_by);

-- Teacher CRUD (own rows only)
DROP POLICY IF EXISTS "Teachers can insert own questions" ON public.question_bank;
CREATE POLICY "Teachers can insert own questions"
ON public.question_bank
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can update own questions" ON public.question_bank;
CREATE POLICY "Teachers can update own questions"
ON public.question_bank
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can delete own questions" ON public.question_bank;
CREATE POLICY "Teachers can delete own questions"
ON public.question_bank
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

-- Admin CRUD (optional; keeps admin dashboard flexible)
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

-- 2) Teacher-owned exam templates (manual question selection supported)
ALTER TABLE public.exam_templates
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.exam_templates
ALTER COLUMN created_by SET DEFAULT auth.uid();

ALTER TABLE public.exam_templates
ADD COLUMN IF NOT EXISTS question_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_exam_templates_created_by ON public.exam_templates(created_by);

-- Teacher manage own templates
DROP POLICY IF EXISTS "Teachers can insert exam templates" ON public.exam_templates;
CREATE POLICY "Teachers can insert exam templates"
ON public.exam_templates
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can update own exam templates" ON public.exam_templates;
CREATE POLICY "Teachers can update own exam templates"
ON public.exam_templates
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can delete own exam templates" ON public.exam_templates;
CREATE POLICY "Teachers can delete own exam templates"
ON public.exam_templates
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

-- 3) Teacher-owned live exam events
ALTER TABLE public.live_exam_events
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.live_exam_events
ALTER COLUMN created_by SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_live_exam_events_created_by ON public.live_exam_events(created_by);

-- Teacher manage own live events
DROP POLICY IF EXISTS "Teachers can insert live exam events" ON public.live_exam_events;
CREATE POLICY "Teachers can insert live exam events"
ON public.live_exam_events
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can update own live exam events" ON public.live_exam_events;
CREATE POLICY "Teachers can update own live exam events"
ON public.live_exam_events
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can delete own live exam events" ON public.live_exam_events;
CREATE POLICY "Teachers can delete own live exam events"
ON public.live_exam_events
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

-- 4) Teacher question-paper uploads (metadata)
CREATE TABLE IF NOT EXISTS public.teacher_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT teacher_papers_storage_path_unique UNIQUE (storage_path)
);

ALTER TABLE public.teacher_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their papers" ON public.teacher_papers;
CREATE POLICY "Teachers can view their papers"
ON public.teacher_papers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can insert their papers" ON public.teacher_papers;
CREATE POLICY "Teachers can insert their papers"
ON public.teacher_papers
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can update their papers" ON public.teacher_papers;
CREATE POLICY "Teachers can update their papers"
ON public.teacher_papers
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND teacher_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can delete their papers" ON public.teacher_papers;
CREATE POLICY "Teachers can delete their papers"
ON public.teacher_papers
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND teacher_id = auth.uid()
);

-- 5) Storage bucket for teacher papers
INSERT INTO storage.buckets (id, name, public)
VALUES ('teacher-papers', 'teacher-papers', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: teachers can access only files under their own folder (<uid>/...)
DROP POLICY IF EXISTS "Teachers can upload their papers" ON storage.objects;
CREATE POLICY "Teachers can upload their papers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teacher-papers'
  AND public.has_role(auth.uid(), 'teacher')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Teachers can read their papers" ON storage.objects;
CREATE POLICY "Teachers can read their papers"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'teacher-papers'
  AND public.has_role(auth.uid(), 'teacher')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Teachers can delete their papers files" ON storage.objects;
CREATE POLICY "Teachers can delete their papers files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'teacher-papers'
  AND public.has_role(auth.uid(), 'teacher')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
