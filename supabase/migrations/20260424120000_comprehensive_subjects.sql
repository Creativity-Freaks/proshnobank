-- Comprehensive Subject List for All Exam Categories

-- SSC Subjects (Class 9-10)
INSERT INTO public.subjects (name, key, category_id, description, is_active)
SELECT 
  'বাংলা ১ম পত্র' as name,
  'ssc_bangla_1' as key,
  (SELECT id FROM public.exam_categories WHERE slug = 'ssc') as category_id,
  'এসএসসি বাংলা প্রথম পত্র' as description,
  true as is_active
ON CONFLICT DO NOTHING;

INSERT INTO public.subjects (name, key, category_id, description, is_active) VALUES
('বাংলা ২য় পত্র', 'ssc_bangla_2', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি বাংলা দ্বিতীয় পত্র', true),
('ইংরেজি ১ম পত্র', 'ssc_english_1', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি ইংরেজি প্রথম পত্র', true),
('ইংরেজি ২য় পত্র', 'ssc_english_2', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি ইংরেজি দ্বিতীয় পত্র', true),
('গণিত', 'ssc_math', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি গণিত', true),
('সাধারণ বিজ্ঞান', 'ssc_general_science', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি সাধারণ বিজ্ঞান', true),
('বাংলাদেশ ও বিশ্বপরিচয়', 'ssc_bd_world', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি সামাজিক বিজ্ঞান', true),
('ধর্ম ও নৈতিক শিক্ষা', 'ssc_religion', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি ধর্ম শিক্ষা', true),
('ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', 'ssc_ict', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি আইসিটি', true),
('পদার্থবিজ্ঞান', 'ssc_physics', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি বিজ্ঞান - পদার্থ', true),
('রসায়ন', 'ssc_chemistry', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি বিজ্ঞান - রসায়ন', true),
('জীববিজ্ঞান', 'ssc_biology', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি বিজ্ঞান - জীব', true),
('উচ্চতর গণিত', 'ssc_higher_math', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি বিজ্ঞান - উচ্চতর গণিত', true),
('ইতিহাস', 'ssc_history', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি মানবিক - ইতিহাস', true),
('ভূগোল', 'ssc_geography', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি মানবিক - ভূগোল', true),
('অর্থনীতি', 'ssc_economics', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি মানবিক - অর্থনীতি', true),
('পৌরনীতি', 'ssc_civics', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি মানবিক - পৌরনীতি', true),
('হিসাববিজ্ঞান', 'ssc_accounting', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি ব্যবসা - হিসাব', true),
('ব্যবসায় উদ্যোগ', 'ssc_business', (SELECT id FROM public.exam_categories WHERE slug = 'ssc'), 'এসএসসি ব্যবসা - ব্যবসা', true)
ON CONFLICT (key) DO NOTHING;

-- HSC Subjects (Class 11-12)
INSERT INTO public.subjects (name, key, category_id, description, is_active) VALUES
('বাংলা', 'hsc_bangla', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি বাংলা', true),
('ইংরেজি', 'hsc_english', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি ইংরেজি', true),
('ICT', 'hsc_ict', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি আইসিটি', true),
('পদার্থবিজ্ঞান', 'hsc_physics', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি বিজ্ঞান - পদার্থ', true),
('রসায়ন', 'hsc_chemistry', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি বিজ্ঞান - রসায়ন', true),
('জীববিজ্ঞান', 'hsc_biology', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি বিজ্ঞান - জীব', true),
('উচ্চতর গণিত', 'hsc_higher_math', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি বিজ্ঞান - উচ্চতর গণিত', true),
('পরিসংখ্যান', 'hsc_statistics', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি বিজ্ঞান - পরিসংখ্যান', true),
('হিসাববিজ্ঞান', 'hsc_accounting', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি ব্যবসা - হিসাব', true),
('ফিন্যান্স', 'hsc_finance', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি ব্যবসা - ফিন্যান্স', true),
('ব্যবস্থাপনা', 'hsc_management', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি ব্যবসা - ব্যবস্থাপনা', true),
('ইতিহাস', 'hsc_history', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি মানবিক - ইতিহাস', true),
('ইসলামিক স্টাডিজ', 'hsc_islamic_studies', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি মানবিক - ইসলামিক', true),
('সমাজবিজ্ঞান', 'hsc_social_science', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি মানবিক - সমাজ', true),
('অর্থনীতি', 'hsc_economics', (SELECT id FROM public.exam_categories WHERE slug = 'hsc'), 'এইচএসসি মানবিক - অর্থনীতি', true)
ON CONFLICT (key) DO NOTHING;

-- Medical Admission Subjects
INSERT INTO public.subjects (name, key, category_id, description, is_active) VALUES
('জীববিজ্ঞান', 'medical_biology', (SELECT id FROM public.exam_categories WHERE slug = 'medical'), 'মেডিকেল ভর্তি - জীব', true),
('রসায়ন', 'medical_chemistry', (SELECT id FROM public.exam_categories WHERE slug = 'medical'), 'মেডিকেল ভর্তি - রসায়ন', true),
('পদার্থবিজ্ঞান', 'medical_physics', (SELECT id FROM public.exam_categories WHERE slug = 'medical'), 'মেডিকেল ভর্তি - পদার্থ', true),
('ইংরেজি', 'medical_english', (SELECT id FROM public.exam_categories WHERE slug = 'medical'), 'মেডিকেল ভর্তি - ইংরেজি', true),
('সাধারণ জ্ঞান', 'medical_gk', (SELECT id FROM public.exam_categories WHERE slug = 'medical'), 'মেডিকেল ভর্তি - জিকে', true)
ON CONFLICT (key) DO NOTHING;

-- Engineering Admission Subjects
INSERT INTO public.subjects (name, key, category_id, description, is_active) VALUES
('উচ্চতর গণিত', 'engineering_higher_math', (SELECT id FROM public.exam_categories WHERE slug = 'engineering'), 'ইঞ্জিনিয়ারিং ভর্তি - গণিত', true),
('পদার্থবিজ্ঞান', 'engineering_physics', (SELECT id FROM public.exam_categories WHERE slug = 'engineering'), 'ইঞ্জিনিয়ারিং ভর্তি - পদার্থ', true),
('রসায়ন', 'engineering_chemistry', (SELECT id FROM public.exam_categories WHERE slug = 'engineering'), 'ইঞ্জিনিয়ারিং ভর্তি - রসায়ন', true),
('ইংরেজি', 'engineering_english', (SELECT id FROM public.exam_categories WHERE slug = 'engineering'), 'ইঞ্জিনিয়ারিং ভর্তি - ইংরেজি', true)
ON CONFLICT (key) DO NOTHING;

-- University Admission Subjects
INSERT INTO public.subjects (name, key, category_id, description, is_active) VALUES
('গণিত', 'university_math', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - গণিত (A Unit)', true),
('পদার্থবিজ্ঞান', 'university_physics', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - পদার্থ (A Unit)', true),
('রসায়ন', 'university_chemistry', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - রসায়ন (A Unit)', true),
('জীববিজ্ঞান', 'university_biology', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - জীব (A Unit)', true),
('বাংলা', 'university_bangla', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - বাংলা (B Unit)', true),
('ইংরেজি', 'university_english', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - ইংরেজি', true),
('সাধারণ জ্ঞান', 'university_gk', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - জিকে', true),
('হিসাববিজ্ঞান', 'university_accounting', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - হিসাব (C Unit)', true),
('ফিন্যান্স', 'university_finance', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - ফিন্যান্স (C Unit)', true),
('ব্যবস্থাপনা', 'university_management', (SELECT id FROM public.exam_categories WHERE slug = 'university'), 'ঢাবি ভর্তি - ব্যবস্থাপনা (C Unit)', true)
ON CONFLICT (key) DO NOTHING;

-- Job Exam Subjects
INSERT INTO public.subjects (name, key, category_id, description, is_active) VALUES
('বাংলা', 'job_bangla', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - বাংলা', true),
('ইংরেজি', 'job_english', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - ইংরেজি', true),
('গণিত', 'job_math', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - গণিত', true),
('সাধারণ জ্ঞান', 'job_gk', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - জিকে', true),
('ICT', 'job_ict', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - আইসিটি', true),
('মানসিক দক্ষতা', 'job_mental_ability', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - মানসিক দক্ষতা', true),
('Logical Reasoning', 'job_logical', (SELECT id FROM public.exam_categories WHERE slug = 'job'), 'চাকরি পরীক্ষা - লজিক্যাল', true)
ON CONFLICT (key) DO NOTHING;
