const SUPA_TOKEN = process.env.SUPA_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF;

const sql = `
-- Create batch_enrollments table
CREATE TABLE IF NOT EXISTS public.batch_enrollments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id      uuid NOT NULL REFERENCES public.exam_batches(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  enrolled_at   timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz,
  payment_ref   text,
  amount_paid   numeric(10,2) DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, batch_id)
);

-- Enable RLS
ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.batch_enrollments;
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.batch_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.batch_enrollments;
DROP POLICY IF EXISTS "Admins manage all enrollments" ON public.batch_enrollments;

-- Users can see their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON public.batch_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own enrollments
CREATE POLICY "Users can enroll themselves"
  ON public.batch_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments (cancel)
CREATE POLICY "Users can update own enrollments"
  ON public.batch_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins manage all enrollments"
  ON public.batch_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin','moderator')
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_batch_enrollment_updated_at()
RETURNS trigger LANGUAGE plpgsql AS \$\$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
\$\$;

DROP TRIGGER IF EXISTS batch_enrollments_updated_at ON public.batch_enrollments;
CREATE TRIGGER batch_enrollments_updated_at
  BEFORE UPDATE ON public.batch_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_batch_enrollment_updated_at();
`;

async function run() {
  const r = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await r.text();
  console.log("HTTP", r.status);
  console.log(text.slice(0, 500));

  // Verify
  const check = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='batch_enrollments' ORDER BY ordinal_position" }),
    }
  );
  const cols = await check.json();
  console.log("\nbatch_enrollments columns:", cols.map(c => c.column_name).join(", "));
}

run().catch(console.error);
