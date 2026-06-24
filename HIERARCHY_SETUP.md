# Hierarchical Category Structure Setup

## New Database Tables

You need to run the following SQL in your Supabase SQL Editor to create the new tables:

### 1. Create Subcategories Table
```sql
CREATE TABLE IF NOT EXISTS category_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES exam_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, name)
);

CREATE INDEX idx_subcategories_category_id ON category_subcategories(category_id);
ALTER TABLE category_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON category_subcategories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON category_subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON category_subcategories FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON category_subcategories FOR DELETE USING (true);
```

### 2. Create Chapters Table
```sql
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, name)
);

CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON chapters FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON chapters FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON chapters FOR DELETE USING (true);
```

### 3. Update Existing Tables (Add Foreign Keys)
```sql
-- Optional: Add columns to link existing data to new hierarchy
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES category_subcategories(id) ON DELETE SET NULL;
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subjects_subcategory_id ON subjects(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON question_bank(chapter_id);
```

## Hierarchy Structure

```
Category (exam_categories)
  ├── Subcategory (category_subcategories)
  │   ├── Subject (subjects)
  │   │   ├── Chapter (chapters)
  │   │   │   └── Question (question_bank)
```

## Example Data

### SSC Category
- SSC Regular Board
  - Bangla (বাংলা)
    - Chapter 1: কবি এবং লেখক
    - Chapter 2: কবিতা
  - English
    - Chapter 1: Prose
    - Chapter 2: Poetry

### HSC Category
- HSC Regular Board
  - Physics
    - Chapter 1: Mechanics
    - Chapter 2: Heat

## Admin Panel Tabs

New tabs added:
- **সাব-ক্যাটেগরি** (AdminSubcategoriesTab): Manage exam types under categories
- **অধ্যায়** (AdminChaptersTab): Manage chapters under subjects

Existing tabs updated:
- **ক্যাটেগরি** (AdminCategoriesTab): Now manages the 6 main categories
- **বিষয়** (AdminSubjectsTab): Now includes subcategory assignment
- **প্রশ্ন** (AdminQuestionsTab): Now includes chapter assignment

## Steps to Use

1. Go to Supabase SQL Editor
2. Run all the SQL queries above in order
3. Go to Admin Panel → সাব-ক্যাটেগরি
4. Create subcategories for each category (e.g., SSC Regular, SSC English Medium)
5. Go to Admin Panel → বিষয়
6. Assign subjects to their subcategories
7. Go to Admin Panel → অধ্যায়
8. Create chapters for each subject
9. Go to Admin Panel → প্রশ্ন
10. Assign questions to their chapters
