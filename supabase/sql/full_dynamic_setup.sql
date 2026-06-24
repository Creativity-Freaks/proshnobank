-- =====================================================================
-- ProshnoBank — Full Dynamic Setup
-- Run this ENTIRE file in your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)
--
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT everywhere.
-- Project: urtptlxotyyjfqynpbwx
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helpers (assumes app_role enum + has_role() already exist)
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROFILES  (one row per auth user; auto-created on signup)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  phone         text,
  institution   text,
  class_level   text,
  registration_type text default 'student',
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, registration_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'registration_type', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that already exist
insert into public.profiles (id, email, full_name, registration_type)
select u.id, u.email,
       coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
       coalesce(u.raw_user_meta_data->>'registration_type', 'student')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 2. SUBSCRIPTION SYSTEM
-- ---------------------------------------------------------------------
create table if not exists public.subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  plan_type     text not null unique,        -- free | student | teacher | premium
  description   text,
  price_monthly numeric not null default 0,
  price_yearly  numeric not null default 0,
  max_practice_exams        integer,         -- null = unlimited
  max_live_exams_per_month  integer,
  max_doubts_per_month      integer,
  question_upload_limit     integer not null default 0,
  batch_student_limit       integer not null default 0,
  omr_grading   boolean not null default false,
  features      jsonb not null default '[]'::jsonb,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan_id       uuid not null references public.subscription_plans(id),
  status        text not null default 'active',   -- active | pending | cancelled | expired
  billing_cycle text default 'monthly',
  started_at    timestamptz not null default now(),
  cancel_at     timestamptz,
  updated_at    timestamptz not null default now()
);

create table if not exists public.billing_history (
  id                   uuid primary key default gen_random_uuid(),
  user_subscription_id uuid references public.user_subscriptions(id) on delete cascade,
  user_id              uuid not null references auth.users(id) on delete cascade,
  amount               numeric not null default 0,
  currency             text not null default 'BDT',
  status               text not null default 'paid',
  billing_date         timestamptz not null default now()
);

create table if not exists public.usage_tracking (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  usage_type  text not null,
  quantity    integer not null default 0,
  month_year  date not null,
  unique (user_id, usage_type, month_year)
);

create table if not exists public.discount_codes (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  discount_percent integer not null default 0,
  applicable_plans jsonb default '[]'::jsonb,
  valid_from       timestamptz not null default now(),
  valid_until      timestamptz,
  max_uses         integer,
  uses_count       integer not null default 0,
  created_at       timestamptz not null default now()
);

alter table public.subscription_plans  enable row level security;
alter table public.user_subscriptions  enable row level security;
alter table public.billing_history      enable row level security;
alter table public.usage_tracking       enable row level security;
alter table public.discount_codes       enable row level security;

-- Plans + discount codes are public-readable
drop policy if exists "plans_read" on public.subscription_plans;
create policy "plans_read" on public.subscription_plans for select using (true);
drop policy if exists "plans_admin_write" on public.subscription_plans;
create policy "plans_admin_write" on public.subscription_plans for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "discount_read" on public.discount_codes;
create policy "discount_read" on public.discount_codes for select using (true);
drop policy if exists "discount_admin_write" on public.discount_codes;
create policy "discount_admin_write" on public.discount_codes for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- User-scoped tables: each user sees only their own rows
drop policy if exists "subs_own" on public.user_subscriptions;
create policy "subs_own" on public.user_subscriptions for all
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'))
  with check (auth.uid() = user_id);

drop policy if exists "billing_own" on public.billing_history;
create policy "billing_own" on public.billing_history for select
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

drop policy if exists "usage_own" on public.usage_tracking;
create policy "usage_own" on public.usage_tracking for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. PDF LIBRARY  (question bank PDFs)
-- ---------------------------------------------------------------------
create table if not exists public.pdf_library (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text,                          -- ssc | hsc | admission | job ...
  subject      text,
  file_url     text not null,
  thumbnail_url text,
  pages        integer,
  downloads    integer not null default 0,
  is_premium   boolean not null default false,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.pdf_library enable row level security;
drop policy if exists "pdf_read" on public.pdf_library;
create policy "pdf_read" on public.pdf_library for select using (is_active = true);
drop policy if exists "pdf_admin_write" on public.pdf_library;
create policy "pdf_admin_write" on public.pdf_library for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------------------------------------------------------------------
-- 4. SITE CONTENT  (dynamic landing page / marketing sections)
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key,               -- hero | features | stats | why_choose | testimonials | faq
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
drop policy if exists "content_read" on public.site_content;
create policy "content_read" on public.site_content for select using (true);
drop policy if exists "content_admin_write" on public.site_content;
create policy "content_admin_write" on public.site_content for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- =====================================================================
-- 5. SEED DATA
-- =====================================================================

-- 5a. Subscription plans
insert into public.subscription_plans
  (name, plan_type, description, price_monthly, price_yearly,
   max_practice_exams, max_live_exams_per_month, max_doubts_per_month,
   question_upload_limit, batch_student_limit, omr_grading, features, sort_order)
values
  ('ফ্রি', 'free', 'শুরু করার জন্য', 0, 0,
   5, 1, 2, 0, 0, false,
   '["সীমিত প্র্যাকটিস পরীক্ষা","দৈনিক ১টি লাইভ পরীক্ষা","বেসিক লিডারবোর্ড"]'::jsonb, 1),
  ('স্টুডেন্ট প্রো', 'student', 'শিক্ষার্থীদের জন্য সেরা', 199, 1990,
   null, null, 30, 0, 0, false,
   '["আনলিমিটেড প্র্যাকটিস পরীক্ষা","সকল লাইভ পরীক্ষা","সকল প্রশ্নব্যাংক","বিস্তারিত অ্যানালিটিক্স"]'::jsonb, 2),
  ('টিচার প্রো', 'teacher', 'শিক্ষকদের জন্য', 499, 4990,
   null, null, null, 1000, 200, true,
   '["প্রশ্ন আপলোড","OMR গ্রেডিং","ব্যাচ ম্যানেজমেন্ট","স্টুডেন্ট রিপোর্ট"]'::jsonb, 3),
  ('প্রিমিয়াম', 'premium', 'সম্পূর্ণ অ্যাক্সেস', 999, 9990,
   null, null, null, 5000, 1000, true,
   '["সব ফিচার আনলকড","প্রায়োরিটি সাপোর্ট","অ্যাডভান্সড অ্যানালিটিক্স"]'::jsonb, 4)
on conflict (plan_type) do nothing;

-- 5b. App settings
insert into public.app_settings (key, value) values
  ('site', '{"name":"ProshnoBank","tagline":"বাংলাদেশের সেরা অনলাইন পরীক্ষা প্ল্যাটফর্ম","support_email":"info.proshnobank@gmail.com","phone":"+8801XXXXXXXXX"}'::jsonb),
  ('exam_defaults', '{"marks_per_question":1,"negative_marks":0.25,"duration_minutes":60}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- 5c. Site content (landing page)
insert into public.site_content (key, value) values
  ('hero', '{"title":"স্বপ্নের পরীক্ষায় সফল হও","subtitle":"হাজারো প্রশ্ন, লাইভ পরীক্ষা আর বিস্তারিত বিশ্লেষণ — সব এক জায়গায়।","cta_primary":"ফ্রি শুরু করুন","cta_secondary":"পরীক্ষা দেখুন"}'::jsonb),
  ('stats', '{"items":[{"label":"মোট শিক্ষার্থী","value":"৫০,০০০+"},{"label":"প্রশ্ন","value":"১,০০,০০০+"},{"label":"লাইভ পরীক্ষা","value":"৫০০+"},{"label":"সাকসেস রেট","value":"৯২%"}]}'::jsonb),
  ('features', '{"title":"কেন ProshnoBank?","items":[{"icon":"BookOpen","title":"বিশাল প্রশ্নব্যাংক","desc":"সকল বিষয়ের হাজারো প্রশ্ন"},{"icon":"Clock","title":"লাইভ পরীক্ষা","desc":"রিয়েল টাইম প্রতিযোগিতা"},{"icon":"BarChart","title":"বিস্তারিত বিশ্লেষণ","desc":"তোমার পারফরম্যান্স ট্র্যাক করো"},{"icon":"Trophy","title":"লিডারবোর্ড","desc":"সেরাদের সাথে প্রতিযোগিতা"}]}'::jsonb),
  ('why_choose', '{"title":"আমাদের বৈশিষ্ট্য","items":[{"title":"অভিজ্ঞ শিক্ষক","desc":"দেশসেরা শিক্ষকদের তৈরি প্রশ্ন"},{"title":"আপডেটেড সিলেবাস","desc":"সর্বশেষ সিলেবাস অনুযায়ী"},{"title":"যেকোনো ডিভাইস","desc":"মোবাইল ও কম্পিউটারে"}]}'::jsonb),
  ('testimonials', '{"items":[{"name":"রাকিব হাসান","role":"মেডিকেল শিক্ষার্থী","text":"ProshnoBank দিয়ে প্রস্তুতি নিয়ে মেডিকেলে চান্স পেয়েছি।","rating":5},{"name":"সাদিয়া আক্তার","role":"ভার্সিটি ভর্তিচ্ছু","text":"লাইভ পরীক্ষাগুলো আমার আত্মবিশ্বাস বাড়িয়েছে।","rating":5},{"name":"তানভীর আহমেদ","role":"HSC শিক্ষার্থী","text":"প্রশ্নের মান অসাধারণ, ব্যাখ্যাগুলো খুব পরিষ্কার।","rating":5}]}'::jsonb),
  ('faq', '{"items":[{"q":"ProshnoBank কি ফ্রি?","a":"হ্যাঁ, ফ্রি প্ল্যানে সীমিত ফিচার ব্যবহার করতে পারবেন।"},{"q":"কীভাবে লাইভ পরীক্ষায় অংশ নেব?","a":"লগইন করে লাইভ পরীক্ষা পেজ থেকে নিবন্ধন করুন।"},{"q":"পেমেন্ট কীভাবে করব?","a":"বিকাশ, নগদ ও কার্ডের মাধ্যমে পেমেন্ট করতে পারবেন।"}]}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- 5d. Sample exam templates (only if table is empty)
insert into public.exam_templates
  (title, description, category, difficulty, duration_minutes, question_count,
   marks_per_question, negative_marks, subjects, topics, subjects_breakdown, features, rating, attempts)
select * from (values
  ('SSC ফুল মডেল টেস্ট','সম্পূর্ণ SSC সিলেবাস','ssc','medium',60,50,1,0.25,
   '["গণিত","পদার্থবিজ্ঞান","রসায়ন"]'::jsonb,'["বীজগণিত","গতি","পরমাণু"]'::jsonb,
   '{"গণিত":20,"পদার্থবিজ্ঞান":15,"রসায়ন":15}'::jsonb,'["তাৎক্ষণিক ফলাফল","ব্যাখ্যাসহ"]'::jsonb,4.7,0),
  ('HSC পদার্থবিজ্ঞান','অধ্যায়ভিত্তিক প্রস্তুতি','hsc','hard',45,40,1,0.25,
   '["পদার্থবিজ্ঞান"]'::jsonb,'["তড়িৎ","চুম্বক"]'::jsonb,
   '{"পদার্থবিজ্ঞান":40}'::jsonb,'["টাইমার","র‍্যাংকিং"]'::jsonb,4.5,0),
  ('মেডিকেল ভর্তি মডেল','মেডিকেল অ্যাডমিশন','medical','hard',60,100,1,0.25,
   '["জীববিজ্ঞান","রসায়ন","পদার্থবিজ্ঞান"]'::jsonb,'["কোষ","জৈব রসায়ন"]'::jsonb,
   '{"জীববিজ্ঞান":40,"রসায়ন":30,"পদার্থবিজ্ঞান":30}'::jsonb,'["নেগেটিভ মার্কিং","ডিটেইলড রিপোর্ট"]'::jsonb,4.8,0)
) as v
where not exists (select 1 from public.exam_templates limit 1);

-- 5e. Sample live exam events (link to first template, only if empty)
insert into public.live_exam_events (template_id, start_time, status, prize, participants)
select id, now() + interval '2 days', 'upcoming', '১০০০ টাকা বৃত্তি', 0
from public.exam_templates
where not exists (select 1 from public.live_exam_events limit 1)
limit 1;

-- 5f. Sample question bank rows (only if empty)
insert into public.question_bank (subject, topic, difficulty, question_text, options, correct_answer, explanation)
select * from (values
  ('গণিত','বীজগণিত','easy'::public.difficulty_level,'2x + 3 = 7 হলে x = কত?',
   '["1","2","3","4"]'::jsonb,1,'2x = 4, তাই x = 2'),
  ('পদার্থবিজ্ঞান','গতি','medium'::public.difficulty_level,'বেগের একক কোনটি?',
   '["মিটার","মিটার/সেকেন্ড","কেজি","নিউটন"]'::jsonb,1,'বেগ = সরণ/সময়, একক মিটার/সেকেন্ড'),
  ('রসায়ন','পরমাণু','easy'::public.difficulty_level,'পানির রাসায়নিক সংকেত কোনটি?',
   '["CO2","H2O","O2","NaCl"]'::jsonb,1,'পানি = H2O')
) as v
where not exists (select 1 from public.question_bank limit 1);

-- =====================================================================
-- DONE. Verify with:  select key from public.site_content;
-- =====================================================================
