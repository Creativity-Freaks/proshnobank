-- Additional exam templates so every category page has content.
-- Safe to re-run: only inserts a category's rows when that category has none.

insert into public.exam_templates (title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, rating, attempts)
select * from (values
  ('ইঞ্জিনিয়ারিং ফুল মডেল টেস্ট', 'engineering', 'BUET/CUET/KUET ধাঁচের পূর্ণাঙ্গ মডেল টেস্ট', 100, 90, 1.0, 0.25, 'hard', '["উচ্চতর গণিত","পদার্থবিজ্ঞান","রসায়ন"]'::jsonb, 4.6, 0),
  ('পদার্থবিজ্ঞান স্পেশাল', 'engineering', 'ইঞ্জিনিয়ারিং ভর্তির পদার্থবিজ্ঞান অধ্যায়ভিত্তিক', 40, 45, 1.0, 0.25, 'medium', '["পদার্থবিজ্ঞান"]'::jsonb, 4.4, 0),
  ('উচ্চতর গণিত প্র্যাকটিস', 'engineering', 'ক্যালকুলাস ও বীজগণিত প্র্যাকটিস সেট', 35, 40, 1.0, 0.25, 'medium', '["উচ্চতর গণিত"]'::jsonb, 4.5, 0)
) as v(title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, rating, attempts)
where not exists (select 1 from public.exam_templates where category = 'engineering');

insert into public.exam_templates (title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, rating, attempts)
select * from (values
  ('বিশ্ববিদ্যালয় ভর্তি মডেল (ক ইউনিট)', 'university', 'ঢাবি/জাবি/রাবি ক ইউনিট ধাঁচের টেস্ট', 80, 60, 1.0, 0.20, 'hard', '["পদার্থবিজ্ঞান","রসায়ন","গণিত","জীববিজ্ঞান"]'::jsonb, 4.7, 0),
  ('বিশ্ববিদ্যালয় ভর্তি মডেল (খ ইউনিট)', 'university', 'মানবিক বিভাগের ভর্তি প্রস্তুতি', 100, 75, 1.0, 0.20, 'medium', '["বাংলা","ইংরেজি","সাধারণ জ্ঞান"]'::jsonb, 4.5, 0),
  ('ইংরেজি স্পেশাল প্র্যাকটিস', 'university', 'ভর্তি পরীক্ষার ইংরেজি প্র্যাকটিস', 30, 25, 1.0, 0.20, 'medium', '["ইংরেজি"]'::jsonb, 4.3, 0)
) as v(title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, rating, attempts)
where not exists (select 1 from public.exam_templates where category = 'university');

insert into public.exam_templates (title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, rating, attempts)
select * from (values
  ('BCS প্রিলি ফুল মডেল', 'job', 'বিসিএস প্রিলিমিনারি ধাঁচের পূর্ণাঙ্গ মডেল', 200, 120, 1.0, 0.50, 'hard', '["বাংলা","ইংরেজি","গণিত","সাধারণ জ্ঞান","আইসিটি"]'::jsonb, 4.8, 0),
  ('ব্যাংক জব মডেল টেস্ট', 'job', 'ব্যাংক নিয়োগ পরীক্ষার মডেল', 80, 60, 1.0, 0.25, 'medium', '["গণিত","ইংরেজি","সাধারণ জ্ঞান"]'::jsonb, 4.6, 0),
  ('প্রাইমারি শিক্ষক নিয়োগ মডেল', 'job', 'প্রাথমিক সহকারী শিক্ষক নিয়োগ প্রস্তুতি', 80, 70, 1.0, 0.25, 'medium', '["বাংলা","ইংরেজি","গণিত","সাধারণ জ্ঞান"]'::jsonb, 4.5, 0),
  ('মানসিক দক্ষতা প্র্যাকটিস', 'job', 'রিজনিং ও মানসিক দক্ষতা প্র্যাকটিস সেট', 30, 25, 1.0, 0.25, 'easy', '["মানসিক দক্ষতা"]'::jsonb, 4.2, 0)
) as v(title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, rating, attempts)
where not exists (select 1 from public.exam_templates where category = 'job');
