-- Exam templates and live exam events

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

CREATE INDEX IF NOT EXISTS idx_live_exam_events_start_time ON public.live_exam_events(start_time);
CREATE INDEX IF NOT EXISTS idx_live_exam_events_template_id ON public.live_exam_events(template_id);

ALTER TABLE public.exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_exam_events ENABLE ROW LEVEL SECURITY;

-- Public read access (safe display data)
DROP POLICY IF EXISTS "Anyone can view exam templates" ON public.exam_templates;
CREATE POLICY "Anyone can view exam templates"
ON public.exam_templates
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view live exam events" ON public.live_exam_events;
CREATE POLICY "Anyone can view live exam events"
ON public.live_exam_events
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin manage (optional; relies on existing has_role)
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
