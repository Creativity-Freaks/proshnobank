-- Public ProshnoBank PDF library (category-based)

CREATE TABLE IF NOT EXISTS public.proshnobank_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT proshnobank_pdfs_storage_path_unique UNIQUE (storage_path),
  CONSTRAINT proshnobank_pdfs_category_check CHECK (category IN ('ssc', 'hsc', 'admission', 'chakri'))
);

CREATE INDEX IF NOT EXISTS idx_proshnobank_pdfs_category_created_at
ON public.proshnobank_pdfs (category, created_at DESC);

ALTER TABLE public.proshnobank_pdfs ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Anyone can view proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Anyone can view proshnobank pdfs"
ON public.proshnobank_pdfs
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin can manage all
DROP POLICY IF EXISTS "Admins can insert proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Admins can insert proshnobank pdfs"
ON public.proshnobank_pdfs
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Admins can update proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Admins can update proshnobank pdfs"
ON public.proshnobank_pdfs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Admins can delete proshnobank pdfs"
ON public.proshnobank_pdfs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Teachers can upload/manage only their own rows
DROP POLICY IF EXISTS "Teachers can insert proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Teachers can insert proshnobank pdfs"
ON public.proshnobank_pdfs
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Teachers can update own proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Teachers can update own proshnobank pdfs"
ON public.proshnobank_pdfs
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

DROP POLICY IF EXISTS "Teachers can delete own proshnobank pdfs" ON public.proshnobank_pdfs;
CREATE POLICY "Teachers can delete own proshnobank pdfs"
ON public.proshnobank_pdfs
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND created_by = auth.uid()
);

-- Storage bucket for ProshnoBank PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('proshnobank-pdfs', 'proshnobank-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Public read access to objects (needed for signed URL creation via anon key)
DROP POLICY IF EXISTS "Anyone can read proshnobank pdf objects" ON storage.objects;
CREATE POLICY "Anyone can read proshnobank pdf objects"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'proshnobank-pdfs');

-- Admin/teacher upload
DROP POLICY IF EXISTS "Admins or teachers can upload proshnobank pdf objects" ON storage.objects;
CREATE POLICY "Admins or teachers can upload proshnobank pdf objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proshnobank-pdfs'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'teacher')
  )
);

-- Admin/teacher delete
DROP POLICY IF EXISTS "Admins or teachers can delete proshnobank pdf objects" ON storage.objects;
CREATE POLICY "Admins or teachers can delete proshnobank pdf objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'proshnobank-pdfs'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'teacher')
  )
);
