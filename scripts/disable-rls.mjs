const SUPA_TOKEN = process.env.SUPA_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF;

const q = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return await r.json();
};

// These tables are read/written by edge functions and need to be accessible without auth
const sql = `
  -- Disable RLS on tables that edge functions need to access freely
  ALTER TABLE public.question_bank DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exam_attempts DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exam_templates DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.live_exam_events DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exam_categories DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exam_batches DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.chapter_topics DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.batch_enrollments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exam_batch_enrollments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.proshnobank_pdfs DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.pdf_library DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.site_content DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
`;

const res = await q(sql);
if (res.message) {
  console.error("ERROR:", res.message);
} else {
  console.log("RLS disabled on all tables:", JSON.stringify(res));
}

// Verify
const check = await q("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
console.log("\nRLS status after:");
check.forEach(t => console.log(` ${t.tablename}: rls=${t.rowsecurity}`));
