-- Create subcategories table (exam types under categories)
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

-- Create chapters table (topics under subjects)
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

-- Add subcategory_id to subjects table (nullable at first for migration)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES category_subcategories(id) ON DELETE SET NULL;

-- Add chapter_id to question_bank table (nullable at first for migration)
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON category_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subjects_subcategory_id ON subjects(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON question_bank(chapter_id);

-- Enable RLS on new tables
ALTER TABLE category_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - can be restricted later)
CREATE POLICY "Allow public read" ON category_subcategories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON category_subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON category_subcategories FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON category_subcategories FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON chapters FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON chapters FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON chapters FOR DELETE USING (true);
