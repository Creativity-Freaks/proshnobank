-- Exam batch enrollments

CREATE TABLE IF NOT EXISTS public.exam_batch_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.exam_batches(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT exam_batch_enrollments_status_check CHECK (status IN ('enrolled', 'cancelled')),
  CONSTRAINT exam_batch_enrollments_unique UNIQUE (user_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_batch_enrollments_user_id ON public.exam_batch_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_batch_enrollments_batch_id ON public.exam_batch_enrollments(batch_id);

ALTER TABLE public.exam_batch_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can see their own enrollments
DROP POLICY IF EXISTS "Users can view own batch enrollments" ON public.exam_batch_enrollments;
CREATE POLICY "Users can view own batch enrollments"
ON public.exam_batch_enrollments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Students can enroll themselves
DROP POLICY IF EXISTS "Users can enroll in batches" ON public.exam_batch_enrollments;
CREATE POLICY "Users can enroll in batches"
ON public.exam_batch_enrollments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin can manage enrollments
DROP POLICY IF EXISTS "Admins can manage batch enrollments" ON public.exam_batch_enrollments;
CREATE POLICY "Admins can manage batch enrollments"
ON public.exam_batch_enrollments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
