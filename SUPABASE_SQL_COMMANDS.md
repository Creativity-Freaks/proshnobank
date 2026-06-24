# Supabase SQL Setup - Copy & Paste

## What's Already Done ✅

Database hierarchy is **already set up** with these tables:

- `exam_categories` - 6 main categories (SSC, HSC, Medical, Engineering, University, Job)
- `exam_categories.parent_id` - For subcategories under main categories
- `subjects` - All subjects
- `chapters` - Chapter/topic structure
- `chapter_topics` - Individual topics within chapters
- `question_bank` - All questions

## What You Need to Do in Supabase

Go to: **Supabase Dashboard → SQL Editor → New Query**

---

### Step 1: Verify Existing Tables (Check if everything is set up)

```sql
-- Check existing exam categories
SELECT id, name, parent_id, is_active 
FROM exam_categories 
WHERE parent_id IS NULL 
LIMIT 10;

-- Check subcategories count
SELECT COUNT(*) as subcategories_count 
FROM exam_categories 
WHERE parent_id IS NOT NULL;

-- Check subjects
SELECT COUNT(*) as subjects_count FROM subjects;

-- Check chapters
SELECT COUNT(*) as chapters_count FROM chapters;

-- Check questions
SELECT COUNT(*) as questions_count FROM question_bank;
```

---

### Step 2: If Tables Don't Exist - Run This Migration

If you get errors from Step 1, run this:

```sql
-- Create chapters table if it doesn't exist
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id VARCHAR(100) NOT NULL,
  chapter_number INT NOT NULL,
  chapter_name_bn VARCHAR(255) NOT NULL,
  chapter_name_en VARCHAR(255),
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, chapter_number)
);

-- Create chapter_topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS chapter_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  topic_name_bn VARCHAR(255) NOT NULL,
  topic_name_en VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapter_topics_chapter_id ON chapter_topics(chapter_id);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - public read access
CREATE POLICY IF NOT EXISTS "chapters_public_read" ON chapters
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "chapter_topics_public_read" ON chapter_topics
  FOR SELECT USING (is_active = true);
```

---

### Step 3: Link Questions to Chapters (Optional - If You Want)

If you want questions linked directly to chapters:

```sql
-- Add chapter_id to question_bank if not exists
ALTER TABLE question_bank
ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_question_bank_chapter_id 
ON question_bank(chapter_id);
```

---

### Step 4: Seed Sample Data (Optional - For Testing)

Add some sample chapters:

```sql
-- Find SSC English subject ID (adjust based on your data)
WITH english_subject AS (
  SELECT id FROM subjects WHERE name ILIKE '%English%' AND name ILIKE '%SSC%' LIMIT 1
)
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order)
VALUES
  ((SELECT id FROM english_subject)::text, 1, 'Grammar', 'Grammar', 1),
  ((SELECT id FROM english_subject)::text, 2, 'Reading', 'Reading Comprehension', 2),
  ((SELECT id FROM english_subject)::text, 3, 'Writing', 'Writing Skills', 3)
ON CONFLICT DO NOTHING;
```

---

## How the Hierarchy Works

```
exam_categories (parent_id = NULL)
└─ exam_categories (parent_id = main category)
   └─ subjects
      └─ chapters
         └─ chapter_topics
            └─ question_bank
```

## Admin Tabs Available

- **ক্যাটেগরি** - Manage main categories (SSC, HSC, etc.)
- **সাব-ক্যাটেগরি** - Manage subcategories (Regular, English Medium, etc.)
- **বিষয়** - Manage subjects
- **অধ্যায়** - Manage chapters
- **প্রশ্ন** - Manage questions

---

## That's It!

Copy-paste the SQL commands above into Supabase SQL Editor and you're done. The admin panel is already ready to use with all the tabs configured! 🎉

