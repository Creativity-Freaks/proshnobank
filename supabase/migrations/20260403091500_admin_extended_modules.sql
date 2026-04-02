-- Extended admin modules: categories, subjects, and exam batches

CREATE TABLE IF NOT EXISTS public.exam_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.exam_templates(id) ON DELETE SET NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  seats INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT exam_batches_status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT exam_batches_duration_check CHECK (duration_days > 0),
  CONSTRAINT exam_batches_seats_check CHECK (seats >= 0)
);

CREATE INDEX IF NOT EXISTS idx_exam_categories_sort_order ON public.exam_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_subjects_category_id ON public.subjects(category_id);
CREATE INDEX IF NOT EXISTS idx_exam_batches_category_id ON public.exam_batches(category_id);
CREATE INDEX IF NOT EXISTS idx_exam_batches_template_id ON public.exam_batches(template_id);
CREATE INDEX IF NOT EXISTS idx_exam_batches_status ON public.exam_batches(status);

ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_batches ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Anyone can view exam categories" ON public.exam_categories;
CREATE POLICY "Anyone can view exam categories"
ON public.exam_categories
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;
CREATE POLICY "Anyone can view subjects"
ON public.subjects
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view exam batches" ON public.exam_batches;
CREATE POLICY "Anyone can view exam batches"
ON public.exam_batches
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin CRUD for categories
DROP POLICY IF EXISTS "Admins can insert exam categories" ON public.exam_categories;
CREATE POLICY "Admins can insert exam categories"
ON public.exam_categories
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update exam categories" ON public.exam_categories;
CREATE POLICY "Admins can update exam categories"
ON public.exam_categories
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete exam categories" ON public.exam_categories;
CREATE POLICY "Admins can delete exam categories"
ON public.exam_categories
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD for subjects
DROP POLICY IF EXISTS "Admins can insert subjects" ON public.subjects;
CREATE POLICY "Admins can insert subjects"
ON public.subjects
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update subjects" ON public.subjects;
CREATE POLICY "Admins can update subjects"
ON public.subjects
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete subjects" ON public.subjects;
CREATE POLICY "Admins can delete subjects"
ON public.subjects
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD for batches
DROP POLICY IF EXISTS "Admins can insert exam batches" ON public.exam_batches;
CREATE POLICY "Admins can insert exam batches"
ON public.exam_batches
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update exam batches" ON public.exam_batches;
CREATE POLICY "Admins can update exam batches"
ON public.exam_batches
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete exam batches" ON public.exam_batches;
CREATE POLICY "Admins can delete exam batches"
ON public.exam_batches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
