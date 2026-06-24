-- ============================================
-- PROSHNOBANK HIERARCHY STRUCTURE VERIFICATION
-- ============================================
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- Step 1: Check if exam_categories table exists with parent_id
SELECT 'exam_categories table structure' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='exam_categories' AND column_name='parent_id'
  ) THEN '✓ EXISTS with parent_id' ELSE '✗ MISSING parent_id' END as status;

-- Step 2: Check if subjects table exists
SELECT 'subjects table' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name='subjects'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- Step 3: Check if chapters table exists
SELECT 'chapters table' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name='chapters'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- Step 4: Show current structure
SELECT 'Current Setup' as section;

-- Base categories (parent_id IS NULL)
SELECT 'Base Categories (Parent ID = NULL)' as category_type, 
  COUNT(*) as total,
  STRING_AGG(DISTINCT name, ', ') as examples
FROM exam_categories
WHERE parent_id IS NULL;

-- Exam subcategories (parent_id IS NOT NULL)
SELECT 'Exam Categories (Parent ID NOT NULL)' as category_type,
  COUNT(*) as total,
  STRING_AGG(DISTINCT name, ', ') as examples
FROM exam_categories
WHERE parent_id IS NOT NULL;

-- Subjects
SELECT 'Subjects' as entity_type,
  COUNT(*) as total,
  STRING_AGG(DISTINCT name, ', ') as examples
FROM subjects;

-- Chapters
SELECT 'Chapters' as entity_type,
  COUNT(*) as total,
  STRING_AGG(DISTINCT name, ', ') as examples
FROM chapters;

-- Questions
SELECT 'Questions' as entity_type,
  COUNT(*) as total,
  COUNT(*) as total_count
FROM question_bank;

-- ============================================
-- DETAILED HIERARCHY VIEW
-- ============================================
SELECT 'COMPLETE HIERARCHY' as section;

-- Show full hierarchy: Base Category → Exam Category → Subjects → Chapters
SELECT 
  base.name as base_category,
  exam.name as exam_category,
  s.name as subject,
  c.name as chapter
FROM exam_categories base
LEFT JOIN exam_categories exam ON exam.parent_id = base.id
LEFT JOIN subjects s ON s.category_id = exam.id
LEFT JOIN chapters c ON c.subject_id = s.id
WHERE base.parent_id IS NULL
LIMIT 50;

-- ============================================
-- IF YOU NEED TO ADD MISSING RELATIONSHIPS
-- ============================================
-- Only run these if you see missing data above

-- Option 1: Link questions to chapters (if chapter_id column exists)
-- ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id);

-- Option 2: If needed, create RLS policies for security
-- Policy examples will be added based on your auth setup
