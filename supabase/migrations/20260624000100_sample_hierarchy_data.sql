-- ============================================
-- SAMPLE DATA FOR HIERARCHY TESTING
-- ============================================
-- Run this if you want to test with sample data
-- This adds example base categories, exam categories, subjects, and chapters

-- Step 1: Add sample base categories (if not already exists)
INSERT INTO exam_categories (name, slug, description, is_active, parent_id)
SELECT 'SSC', 'ssc', 'Secondary School Certificate', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM exam_categories WHERE slug='ssc' AND parent_id IS NULL);

INSERT INTO exam_categories (name, slug, description, is_active, parent_id)
SELECT 'HSC', 'hsc', 'Higher Secondary Certificate', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM exam_categories WHERE slug='hsc' AND parent_id IS NULL);

INSERT INTO exam_categories (name, slug, description, is_active, parent_id)
SELECT 'Medical', 'medical', 'Medical Entrance Exams', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM exam_categories WHERE slug='medical' AND parent_id IS NULL);

-- Step 2: Get base category IDs
WITH base_cats AS (
  SELECT id FROM exam_categories WHERE parent_id IS NULL AND slug IN ('ssc', 'hsc', 'medical')
)

-- Step 3: Add sample exam categories under SSC
INSERT INTO exam_categories (name, slug, description, is_active, parent_id)
SELECT 'SSC 2026 বিজ্ঞান', 'ssc-2026-science', 'SSC 2026 Science Track', true, 
  (SELECT id FROM exam_categories WHERE slug='ssc' AND parent_id IS NULL LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM exam_categories WHERE slug='ssc-2026-science'
);

INSERT INTO exam_categories (name, slug, description, is_active, parent_id)
SELECT 'SSC 2026 মানবিক', 'ssc-2026-humanities', 'SSC 2026 Humanities Track', true,
  (SELECT id FROM exam_categories WHERE slug='ssc' AND parent_id IS NULL LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM exam_categories WHERE slug='ssc-2026-humanities'
);

INSERT INTO exam_categories (name, slug, description, is_active, parent_id)
SELECT 'SSC 2026 বাণিজ্য', 'ssc-2026-commerce', 'SSC 2026 Commerce Track', true,
  (SELECT id FROM exam_categories WHERE slug='ssc' AND parent_id IS NULL LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM exam_categories WHERE slug='ssc-2026-commerce'
);

-- Step 4: Add sample subjects (only if empty)
INSERT INTO subjects (category_id, name, key, description, is_active)
SELECT 
  (SELECT id FROM exam_categories WHERE slug='ssc-2026-science' LIMIT 1),
  'Bangla',
  'ssc_bangla_1',
  'Bengali Language and Literature',
  true
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE key='ssc_bangla_1');

INSERT INTO subjects (category_id, name, key, description, is_active)
SELECT 
  (SELECT id FROM exam_categories WHERE slug='ssc-2026-science' LIMIT 1),
  'English',
  'ssc_english_1',
  'English Language and Literature',
  true
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE key='ssc_english_1');

INSERT INTO subjects (category_id, name, key, description, is_active)
SELECT 
  (SELECT id FROM exam_categories WHERE slug='ssc-2026-science' LIMIT 1),
  'Mathematics',
  'ssc_math_1',
  'Mathematics',
  true
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE key='ssc_math_1');

INSERT INTO subjects (category_id, name, key, description, is_active)
SELECT 
  (SELECT id FROM exam_categories WHERE slug='ssc-2026-science' LIMIT 1),
  'Physics',
  'ssc_physics_1',
  'Physics',
  true
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE key='ssc_physics_1');

INSERT INTO subjects (category_id, name, key, description, is_active)
SELECT 
  (SELECT id FROM exam_categories WHERE slug='ssc-2026-science' LIMIT 1),
  'Chemistry',
  'ssc_chemistry_1',
  'Chemistry',
  true
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE key='ssc_chemistry_1');

INSERT INTO subjects (category_id, name, key, description, is_active)
SELECT 
  (SELECT id FROM exam_categories WHERE slug='ssc-2026-science' LIMIT 1),
  'Biology',
  'ssc_biology_1',
  'Biology',
  true
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE key='ssc_biology_1');

-- Step 5: Add sample chapters for Mathematics
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order)
VALUES 
  ('ssc_math_1', 1, 'সংখ্যা ব্যবস্থা', 'Number System', 1),
  ('ssc_math_1', 2, 'বীজগণিত', 'Algebra', 2),
  ('ssc_math_1', 3, 'জ্যামিতি', 'Geometry', 3)
ON CONFLICT DO NOTHING;

-- Step 6: Verify all data was added
SELECT 'Sample Data Summary' as status;
SELECT COUNT(*) as base_categories FROM exam_categories WHERE parent_id IS NULL;
SELECT COUNT(*) as exam_categories FROM exam_categories WHERE parent_id IS NOT NULL;
SELECT COUNT(*) as subjects FROM subjects;
SELECT COUNT(*) as chapters FROM chapters;
