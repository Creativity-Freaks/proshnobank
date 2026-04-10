-- Seed example subcategories (years/streams) under parent categories.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING based on slug uniqueness).

-- NOTE: This assumes parent categories exist (seeded in 20260411093000_seed_exam_categories.sql).

with parents as (
  select id, slug
  from public.exam_categories
  where parent_id is null
)
insert into public.exam_categories (name, slug, description, is_active, sort_order, parent_id)
select * from (
  -- SSC
  select 'SSC 2026'::text, 'ssc-2026'::text, 'SSC 2026 ব্যাচসমূহ'::text, true, 101, (select id from parents where slug='ssc')
  union all
  select 'SSC 2025', 'ssc-2025', 'SSC 2025 ব্যাচসমূহ', true, 102, (select id from parents where slug='ssc')
  union all
  select 'SSC বিজ্ঞান', 'ssc-science', 'SSC বিজ্ঞান বিভাগের ব্যাচসমূহ', true, 111, (select id from parents where slug='ssc')
  union all
  select 'SSC ব্যবসা', 'ssc-commerce', 'SSC ব্যবসা বিভাগের ব্যাচসমূহ', true, 112, (select id from parents where slug='ssc')
  union all
  select 'SSC মানবিক', 'ssc-arts', 'SSC মানবিক বিভাগের ব্যাচসমূহ', true, 113, (select id from parents where slug='ssc')

  -- HSC
  union all
  select 'HSC 2026', 'hsc-2026', 'HSC 2026 ব্যাচসমূহ', true, 201, (select id from parents where slug='hsc')
  union all
  select 'HSC 2025', 'hsc-2025', 'HSC 2025 ব্যাচসমূহ', true, 202, (select id from parents where slug='hsc')
  union all
  select 'HSC বিজ্ঞান', 'hsc-science', 'HSC বিজ্ঞান বিভাগের ব্যাচসমূহ', true, 211, (select id from parents where slug='hsc')
  union all
  select 'HSC ব্যবসা', 'hsc-commerce', 'HSC ব্যবসা বিভাগের ব্যাচসমূহ', true, 212, (select id from parents where slug='hsc')
  union all
  select 'HSC মানবিক', 'hsc-arts', 'HSC মানবিক বিভাগের ব্যাচসমূহ', true, 213, (select id from parents where slug='hsc')

  -- Medical
  union all
  select 'MAT', 'medical-mat', 'Medical MAT ব্যাচসমূহ', true, 301, (select id from parents where slug='medical')
  union all
  select 'DAT', 'medical-dat', 'Medical DAT ব্যাচসমূহ', true, 302, (select id from parents where slug='medical')

  -- Engineering
  union all
  select 'Engineering 2026', 'engineering-2026', 'Engineering 2026 ব্যাচসমূহ', true, 401, (select id from parents where slug='engineering')
  union all
  select 'Engineering 2025', 'engineering-2025', 'Engineering 2025 ব্যাচসমূহ', true, 402, (select id from parents where slug='engineering')

  -- University (Varsity)
  union all
  select 'Varsity 2026', 'university-2026', 'Varsity 2026 ব্যাচসমূহ', true, 501, (select id from parents where slug='university')
  union all
  select 'Varsity 2025', 'university-2025', 'Varsity 2025 ব্যাচসমূহ', true, 502, (select id from parents where slug='university')
) as rows(name, slug, description, is_active, sort_order, parent_id)
where rows.parent_id is not null
on conflict (slug) do nothing;
