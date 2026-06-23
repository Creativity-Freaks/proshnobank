-- Create chapters table for Bangladesh curriculum
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

-- Create chapter_topics table
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

-- Create indexes for faster queries
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_chapter_topics_chapter_id ON chapter_topics(chapter_id);

-- Insert SSC Bangla 1st Paper chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('ssc_bangla_1', 1, 'গদ্য', 'Prose', 1),
('ssc_bangla_1', 2, 'কবিতা', 'Poetry', 2),
('ssc_bangla_1', 3, 'নাটক', 'Drama', 3),
('ssc_bangla_1', 4, 'অনুশীলনী', 'Practice', 4);

-- Insert topics for SSC Bangla 1
INSERT INTO chapter_topics (chapter_id, topic_name_bn, topic_name_en, display_order)
SELECT id, topic_name_bn, topic_name_en, display_order FROM (
  SELECT c.id, topic_name_bn, topic_name_en, ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY topic_name_bn) - 1 as display_order
  FROM chapters c
  CROSS JOIN (
    VALUES 
      ('সাহিত্য', 'Literature'),
      ('ব্যাকরণ', 'Grammar'),
      ('রচনা', 'Composition')
  ) AS topics(topic_name_bn, topic_name_en)
  WHERE c.subject_id = 'ssc_bangla_1'
) AS joined_topics;

-- Insert SSC Bangla 2nd Paper chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('ssc_bangla_2', 1, 'গদ্য', 'Prose', 1),
('ssc_bangla_2', 2, 'কবিতা', 'Poetry', 2),
('ssc_bangla_2', 3, 'নাটক', 'Drama', 3);

-- Insert SSC English chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('ssc_english_1', 1, 'Reading Comprehension', 'Reading Comprehension', 1),
('ssc_english_1', 2, 'Grammar', 'Grammar', 2),
('ssc_english_1', 3, 'Writing', 'Writing', 3),
('ssc_english_2', 1, 'Literature', 'Literature', 1),
('ssc_english_2', 2, 'Writing', 'Writing', 2);

-- Insert SSC Math chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('ssc_math', 1, 'বাস্তব সংখ্যা', 'Real Numbers', 1),
('ssc_math', 2, 'সেট ও ফাংশন', 'Set and Function', 2),
('ssc_math', 3, 'বীজগণিত', 'Algebra', 3),
('ssc_math', 4, 'জ্যামিতি', 'Geometry', 4),
('ssc_math', 5, 'ত্রিকোণমিতি', 'Trigonometry', 5),
('ssc_math', 6, 'পরিসংখ্যান', 'Statistics', 6);

-- Insert HSC Higher Math chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('hsc_higher_math', 1, 'ভেক্টর', 'Vector', 1),
('hsc_higher_math', 2, 'ম্যাট্রিক্স', 'Matrix', 2),
('hsc_higher_math', 3, 'সমীকরণ', 'Equations', 3),
('hsc_higher_math', 4, 'অসমীকরণ', 'Inequalities', 4),
('hsc_higher_math', 5, 'ফাংশন', 'Function', 5),
('hsc_higher_math', 6, 'অন্তরকলন', 'Differentiation', 6),
('hsc_higher_math', 7, 'সমাকলন', 'Integration', 7),
('hsc_higher_math', 8, 'ডিফারেনশিয়াল সমীকরণ', 'Differential Equation', 8),
('hsc_higher_math', 9, 'জটিল সংখ্যা', 'Complex Number', 9),
('hsc_higher_math', 10, 'ত্রিকোণমিতি', 'Trigonometry', 10);

-- Insert HSC Physics chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('hsc_physics', 1, 'ভৌত জগৎ ও পরিমাপ', 'Physical World and Measurement', 1),
('hsc_physics', 2, 'গতিবিজ্ঞান', 'Kinematics', 2),
('hsc_physics', 3, 'বলবিজ্ঞান', 'Dynamics', 3),
('hsc_physics', 4, 'শক্তি ও কাজ', 'Work and Energy', 4),
('hsc_physics', 5, 'ঘূর্ণন গতি', 'Rotational Motion', 5),
('hsc_physics', 6, 'দোলনগতি ও তরঙ্গ', 'Oscillation and Waves', 6);

-- Insert HSC Chemistry chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('hsc_chemistry', 1, 'পরমাণুর গঠন', 'Structure of Atom', 1),
('hsc_chemistry', 2, 'রাসায়নিক বন্ধন', 'Chemical Bonding', 2),
('hsc_chemistry', 3, 'পর্যায়ক্রমী ধর্মাবলী', 'Periodic Properties', 3),
('hsc_chemistry', 4, 'রাসায়নিক সমীকরণ', 'Chemical Equation', 4),
('hsc_chemistry', 5, 'জারণ বিজারণ', 'Oxidation Reduction', 5),
('hsc_chemistry', 6, 'রাসায়নিক গতিবিদ্যা', 'Chemical Kinetics', 6),
('hsc_chemistry', 7, 'রাসায়নিক ভারসাম্য', 'Chemical Equilibrium', 7),
('hsc_chemistry', 8, 'জৈব রসায়ন', 'Organic Chemistry', 8);

-- Insert HSC Biology chapters
INSERT INTO chapters (subject_id, chapter_number, chapter_name_bn, chapter_name_en, display_order) VALUES
('hsc_biology', 1, 'কোষ ও এর গঠন', 'Cell and Structure', 1),
('hsc_biology', 2, 'কোষ বিভাজন', 'Cell Division', 2),
('hsc_biology', 3, 'প্রাণীর পুষ্টি', 'Nutrition in Animals', 3),
('hsc_biology', 4, 'উদ্ভিদের পুষ্টি', 'Nutrition in Plants', 4),
('hsc_biology', 5, 'শ্বসন', 'Respiration', 5),
('hsc_biology', 6, 'সালোকসংশ্লেষণ', 'Photosynthesis', 6),
('hsc_biology', 7, 'প্রজনন', 'Reproduction', 7);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "chapters_public_read" ON chapters
  FOR SELECT USING (is_active = true);

CREATE POLICY "chapter_topics_public_read" ON chapter_topics
  FOR SELECT USING (is_active = true);

-- Allow admin to manage chapters
CREATE POLICY "chapters_admin_manage" ON chapters
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "chapter_topics_admin_manage" ON chapter_topics
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
